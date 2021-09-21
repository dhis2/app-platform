import {
    MODEL_TO_EDIT_FIELD_CHANGED,
    EVENT_PROGRAM_LOAD,
    EVENT_PROGRAM_SAVE,
    EVENT_PROGRAM_SAVE_SUCCESS,
    EVENT_PROGRAM_SAVE_ERROR,
    loadEventProgramSuccess,
    saveEventProgramError,
    saveEventProgramSuccess,
} from './actions';

import {
    PROGRAM_STAGE_FIELD_EDIT,
} from './tracker-program/program-stages/actions';

import eventProgramStore, {
    isStoreStateDirty,
    getMetaDataToSend,
} from './eventProgramStore';

import { Observable } from 'rxjs';
import { combineEpics } from 'redux-observable';

import {
    get,
    getOr,
    first,
    map,
    compose,
    values,
    flatten,
} from 'lodash/fp';

import { getInstance } from 'd2/lib/d2';
import { generateUid } from 'd2/lib/uid';

import { getImportStatus } from './metadataimport-helpers';
import { goToAndScrollUp } from '../../router-utils';

import notificationEpics from './notifications/epics';
import createAssignDataElementEpics from './assign-data-elements/epics';
import createAssignAttributeEpics from './tracker-program/assign-tracked-entity-attributes/epics';
import createCreateDataEntryFormEpics from './create-data-entry-form/epics';
import createEnrollmentDataEntryFormEpics from './tracker-program/assign-tracked-entity-attributes/data-entry-form/epics';
import dataEntryFormEpics from './data-entry-form/epics';
import trackerProgramEpics from './tracker-program/epics';
import { createModelToEditEpic, createModelToEditProgramStageEpic } from '../epicHelpers';
import getMissingValuesForModelName from '../../forms/getMissingValuesForModelName';

import showSnackBarMessageEpic from '../../Snackbar/epics';
import { notifyUser } from '../actions';
import snackActions from '../../Snackbar/snack.actions';
import { removeDataElementsFromStage} from './assign-data-elements/actions';
const d2$ = Observable.fromPromise(getInstance());
const api$ = d2$.map(d2 => d2.Api.getApi());

function loadEventProgramMetadataByProgramId(programPayload) {
    const programId = programPayload.id;
    if (programId === 'add') {
        const programUid = generateUid();
        const programStageUid = generateUid();

        // A api format payload that contains a program and a programStage
        const programStages =
            programPayload.query.type === 'WITH_REGISTRATION'
                ? []
                : [{
                    id: programStageUid,
                    programStageDataElements: [],
                    notificationTemplates: [],
                    programStageSections: [],
                }];
        const newProgramMetadata = {
            programs: [
                {
                    id: programUid,
                    programStages,
                    programTrackedEntityAttributes: [],
                    organisationUnits: [],
                },
            ],
        };

        const availableData$ = d2$.flatMap((d2) => {
            const dataElements$ = Observable.fromPromise(
                d2.models.dataElements
                    .filter()
                    .on('domainType')
                    .equals('TRACKER')
                    .list({ paging: false })
                    .then(dataElements => dataElements.toArray()),
            );
            const trackedEntityAttributes$ = Observable.fromPromise(
                d2.models.trackedEntityAttributes
                    .list({ paging: false })
                    .then(attributes => attributes.toArray()),
            );
            const renderingOptions$ = Observable.fromPromise(
                d2.Api.getApi().get('staticConfiguration/renderingOptions'),
            );

            return Observable.combineLatest(
                dataElements$,
                trackedEntityAttributes$,
                renderingOptions$,
                (elements, attributes, renderingOptions) => ({
                    elements,
                    attributes,
                    renderingOptions,
                }),
            );
        });

        return Observable.combineLatest(
            Observable.of(newProgramMetadata),
            // Load the available dataElements and attributes from the api
            availableData$,
            (metadata, available) => ({
                ...metadata,
                dataElements: available.elements,
                trackedEntityAttributes: available.attributes,
                renderingOptions: available.renderingOptions,
            }),
        )
            .flatMap(createEventProgramStoreStateFromMetadataResponse)
            .map((state) => {
                // Set some eventProgram defaults
                // Set programType to router-query type
                // fallback to event program
                const programType = programPayload.query.type || "WITHOUT_REGISTRATION";

                state.program.programType = programType;
                if (state.programStages.length > 0) {
                    const programStage = first(state.programStages);
                    programStage.name = state.program.id;
                }

                return state;
            });
    }

    const programFields = [
        ':owner,displayName',
        'attributeValues[:all,attribute[id,name,displayName]]',
        'organisationUnits[id,path]',
        'dataEntryForm[:owner]',
        'programSections[id,name,displayName,renderType,program,sortOrder,lastUpdated,trackedEntityAttributes[id,name,displayName,sortOrder]]',
        'notificationTemplates[:owner]',
        'programTrackedEntityAttributes',
        'user[id,name]',
        'publicAccess',
        'userGroupAccesses',
        'userAccesses'
    ].join(',');

    // Tomcat 8.5 does not allow unencoded brackets in querystrings. By passing the query params
    // as an object to d2 it will url encode all params and escape the brackets
    const queryParams = {
        fields: ':owner,displayName',
        'programs:filter': `id:eq:${programId}`,
        'programs:fields': `${programFields},programStages[:owner, publicAccess, userGroupAccesses, userAccesses, user[id,name],displayName,attributeValues[:all,attribute[id,name,displayName]],programStageDataElements[:owner,renderType,dataElement[id,displayName,valueType,optionSet,domainType]],notificationTemplates[:owner,displayName],dataEntryForm[:owner],programStageSections[:owner,displayName,dataElements[id,displayName]]]`,
        'dataElements:fields': 'id,displayName,valueType,optionSet',
        'dataElements:filter': 'domainType:eq:TRACKER',
        'trackedEntityAttributes:fields': 'id,displayName,valueType,optionSet,unique'
    }

    return api$
        .flatMap((api) => {
            const metadata$ = Observable.fromPromise(
                api.get('metadata', queryParams),
            );
            const renderingOptions$ = Observable.fromPromise(
                api.get('staticConfiguration/renderingOptions'),
            );
            return Observable.combineLatest(
                metadata$,
                renderingOptions$,
                (metadata, renderingOptions) => ({
                    ...metadata,
                    renderingOptions,
                }),
            );
        })
        .flatMap(createEventProgramStoreStateFromMetadataResponse);
}

function createEventProgramStoreStateFromMetadataResponse(
    eventProgramMetadata,
) {
    const {
        programs = [],
        dataElements = [],
        trackedEntityAttributes = [],
        renderingOptions = [],
    } = eventProgramMetadata;

    const programStages = getOr([], 'programStages', first(programs));

    const storeState = getInstance().then((d2) => {
        // createModelFor :: ModelDefinition -> Function -> Model
        const createModelFor = schema => schema.create.bind(schema);

        // createProgramModel :: Array<Object> -> Model
        const createProgramModel = compose(
            createModelFor(d2.models.program),
            first,
        );

        // createProgramStageSectionModels :: Array<Object> -> Array<Model>
        const createProgramStageSectionModels = map(
            createModelFor(d2.models.programStageSection),
        );

        // createProgramStageModels :: Array<Object> -> Array<Model>
        const createProgramStageModels = map(
            createModelFor(d2.models.programStage),
        );

        // createNotificationTemplateModels :: Array<Object> -> Array<Model>
        const createNotificationTemplateModels = map(
            createModelFor(d2.models.programNotificationTemplate),
        );

        const extractProgramStageSections =
            programStages =>
                programStages.reduce(
                    (acc, programStage) => ({
                        ...acc,
                        [programStage.id]: createProgramStageSectionModels(
                            getOr([], 'programStageSections', programStage),
                        ),
                    }),
                    {},
                );

        // extractProgramNotifications :: Array<Object> -> Object<programStageId, [Model]>
        const extractProgramNotifications = programStages =>
            programStages.reduce(
                (acc, programStage) => ({
                    ...acc,
                    [programStage.id]: createNotificationTemplateModels(
                        getOr([], 'notificationTemplates', programStage),
                    ),
                }),
                {},
            );

        // createDataEntryFormModel :: Object<DataEntryForm> :: Model<DataEntryForm>
        const createDataEntryFormModel = createModelFor(
            d2.models.dataEntryForm,
        );

        // extractDataEntryForms :: Array<Object> -> Object<programStageId, Model>
        const extractDataEntryForms = programStages =>
            programStages.reduce(
                (acc, programStage) => ({
                    ...acc,
                    [programStage.id]: createDataEntryFormModel(
                        getOr({}, 'dataEntryForm', programStage),
                    ),
                }),
                {},
            );

        const program = createProgramModel(programs);
        program.dataEntryForm = program.dataEntryForm ? createDataEntryFormModel(getOr({}, 'dataEntryForm', program)) : undefined;

        return {
            program,
            programStages: createProgramStageModels(programStages),
            programStageNotifications: extractProgramNotifications(
                programStages,
            ),
            programStageSections: extractProgramStageSections(programStages),
            programSections: program.programSections.toArray(),
            availableDataElements: dataElements,
            availableAttributes: trackedEntityAttributes,
            renderingOptions,
            dataEntryFormForProgramStage: extractDataEntryForms(programStages),
        };
    });
    return Observable.fromPromise(storeState);
}

async function loadAdditionalTrackerMetadata(loadedMetadata) {
    const program = loadedMetadata.program;

    if(!program.programType || program.programType !== 'WITH_REGISTRATION' || !program.trackedEntityType) {
        return loadedMetadata;
    }
    //Load trackedEntityTypeAttributes
    const tetId = program.trackedEntityType.id;
    const d2 = await getInstance();
    try {
        const tet = await d2.models.trackedEntityType.get(tetId, {
            fields: 'id,displayName,name,trackedEntityTypeAttributes[trackedEntityAttribute]'
        });
        program.trackedEntityType = tet;
        program.resetDirtyState();
    } catch(e) {
        return loadedMetadata;
    }

    return loadedMetadata;
}

/**
 * Checks the program for elements that have programStageDataElements with
 * domainType=AGGREGATE, and gives the user a notification and the ability
 * to remove these automatically.
 * There should be a restriction server side, but this is helpful for
 * already affected instances.
 * @param {*} state the state of the eventProgram store
 */
function aggregatePSDENotification(state) {

    const removeOffendingElements = (programStageIDs, dataElements) => {
        const actions = programStageIDs.map(psID => removeDataElementsFromStage({ programStage: psID, dataElements }));
        snackActions.hide();
        return actions;
    }
    const offendingElementIDs = [];
    const offendingPSIDs = [];

    state.programStages.forEach(ps => {
        ps.programStageDataElements.forEach(psde => {
            const { dataElement } = psde;
            if (dataElement && dataElement.domainType && dataElement.domainType !== "TRACKER") {
                const message = `Program stage '${ps.displayName}' contains a program stage data element with domainType '${dataElement.domainType}'.
This is not allowed. Offending dataElement is '${dataElement.displayName}' with ID '${dataElement.id}'`;
                console.warn(message);
                offendingElementIDs.push(dataElement.id);
                offendingPSIDs.push(ps.id);
            }
        })
    });
    if (offendingPSIDs.length > 0) {
        const prom = new Promise((resolve, reject) => {
            snackActions.show({
                message: `The following program stages: '${offendingPSIDs.join(', ')}' contain program stage data elements with domainType=AGGREGATE. This is not allowed.
    Click the REMOVE button to clean up, or click anywhere on the page to ignore this issue. See the log for more details.`,
                action: 'remove',
                onActionTouchTap: (e) => resolve(removeOffendingElements(offendingPSIDs, offendingElementIDs))
            });
        });
        return Observable.from(prom).mergeAll();
    }
    return Observable.never();
}

export const programModel = (action$) =>
    action$
        .ofType(EVENT_PROGRAM_LOAD)
        .map(get('payload'))
        .flatMap(loadEventProgramMetadataByProgramId)
        .flatMap(loadAdditionalTrackerMetadata)
        .do(storeState => eventProgramStore.setState(storeState))
        .flatMap(state =>
            aggregatePSDENotification(state).merge(
                Observable.of(loadEventProgramSuccess())
            )
        );

export const programModelEdit = createModelToEditEpic(
    MODEL_TO_EDIT_FIELD_CHANGED,
    eventProgramStore,
    'program',
);

export const programStageModelEdit = createModelToEditProgramStageEpic(
    PROGRAM_STAGE_FIELD_EDIT,
    eventProgramStore,
    'programStages',
);

const setEventPSStage = (state) => {
    if (state.program.programType === "WITH_REGISTRATION") {
        return state;
    }

    const ps = first(state.programStages);
    ps.name = state.program.name || state.program.id;
    return {
        ...state,
        programStages: [ps],
    };
};

const saveEventProgram = eventProgramStore
    .take(1)
    .filter(isStoreStateDirty)
    .map(setEventPSStage)
    .map(getMetaDataToSend)
    .flatMap(metaDataPayload =>
        api$
            .flatMap(api =>
                Observable.fromPromise(api.post('metadata', metaDataPayload)),
            )
            .map(getImportStatus)
            .map((importStatus) => {
                if (importStatus.isOk()) {
                    // TODO: Not the most elegant place to do this maybe
                    goToAndScrollUp('/list/programSection/program');
                    return saveEventProgramSuccess();
                }
                return saveEventProgramError(importStatus.errorsPerObject);
            })
            .catch(err => Observable.of(saveEventProgramError(err))),
    );

/**
 * @param {Object} eventProgramStore d2-ui store
 * @param {Object} d2 Instance of d2
 * @return {Promise<eventProgramStore>} A promise that resolves eventProgramStore
*/
const checkProgramForRequiredValues = (eventProgramStore, d2) => {
    const { program } = eventProgramStore;
    const modelType = 'program';
    const formFieldOrder = program.programType === 'WITH_REGISTRATION'
        ? 'trackerProgram'
        : 'eventProgram'
    const missingFields = getMissingValuesForModelName(d2, modelType, formFieldOrder, program);

    return { eventProgramStore, missingFields };
}

const createSaveEventProgramError$ = missingFields => Observable.of(
    saveEventProgramError({
        message: missingFields.length === 1
            ? 'required_value_missing'
            : 'required_values_missing',
        translate: true,
        variables: {
            [missingFields.length > 1 ? 'FIELDS' : 'FIELD']:
                missingFields.join(', '),
        }
    }),
);

const createSaveEventProgramSuccess$ = () => Observable
    .of(saveEventProgramSuccess())
    .concat(
        Observable
            .of(notifyUser({message: 'no_changes_to_be_saved', translate: true}))
            .do(() => goToAndScrollUp('/list/programSection/program'))
    )
;

export const programModelSave = action$ =>
    action$
        .ofType(EVENT_PROGRAM_SAVE)
        .flatMapTo(eventProgramStore.take(1))

        // get missing fields
        .combineLatest(d2$)
        .map(([ eventProgramStore, d2 ]) => checkProgramForRequiredValues(eventProgramStore, d2))

        // determine next action
        .switchMap(({ eventProgramStore, missingFields }) => (
            missingFields.length
                ? createSaveEventProgramError$(missingFields)

            : isStoreStateDirty(eventProgramStore)
                ? saveEventProgram

            : createSaveEventProgramSuccess$()
        ))

        // handle errors
        .catch(e => console.log(e));

export const programModelSaveResponses = action$ =>
    Observable.merge(
        action$.ofType(EVENT_PROGRAM_SAVE_SUCCESS).mapTo(notifyUser({message: 'success', translate: true})),
        action$.ofType(EVENT_PROGRAM_SAVE_ERROR).map((action) => {
            const getFirstErrorFromAction = compose(
                first,
                flatten,
                values,
                getOr([], 'errors'),
                first,
            );

            const firstErrorMessage = getFirstErrorFromAction(action.payload) || action.payload;

            return notifyUser(firstErrorMessage);
        }),
    );

export default combineEpics(
    programModel,
    programModelEdit,
    programStageModelEdit,
    programModelSave,
    programModelSaveResponses,
    notificationEpics,
    createAssignDataElementEpics(eventProgramStore),
    createAssignAttributeEpics(eventProgramStore),
    createCreateDataEntryFormEpics(eventProgramStore),
    createEnrollmentDataEntryFormEpics(eventProgramStore),
    dataEntryFormEpics,
    trackerProgramEpics,
    showSnackBarMessageEpic,
);
