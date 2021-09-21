import Store from 'd2-ui/lib/store/Store';
import { equals, some, get, compose, identity, map, __, concat, isObject, values, flatten } from 'lodash/fp';
import { getOwnedPropertyJSON } from 'd2/lib/model/helpers/json';
import { getMetaDataToSend } from './event-program-store/getMetaDataToSend'

// ___ programSelector :: StoreState -> Model<Program>
const programSelector = get('program');

// ___ programStagesSelector :: StoreState -> Array<Model<ProgramStage>>
const programStagesSelector = get('programStages');

// ___ programStageSectionsSelector :: StoreState -> Array<Model<ProgramStageSection>>
const programStageSectionsSelector = get('programStageSections');

// ___ programStageNotificationsSelector :: StoreState -> Object<programStageId, programStageNotifications>
const programStageNotificationsSelector = get('programStageNotifications');

// ___ dataEntryFormsSelector :: StoreState -> Object<programStageId, DataEntryForm>
const dataEntryFormsSelector = get('dataEntryFormForProgramStage');

const programNotificationsSelector = get('program.notificationTemplates');

// ___ checkIfDirty :: Model -> Boolean
const checkIfDirty = model => model && model.isDirty();

// ___ modelToJson :: Model -> Object
const modelToJson = getOwnedPropertyJSON;

// ___ isProgramStageDirty :: Object<StoreState> -> Object<{programStages}> -> Boolean
const isProgramStageDirty = compose(some(checkIfDirty), programStagesSelector);

// ___ hasDirtyProgramStageSections :: Object<StoreState> -> Boolean
//const hasDirtyProgramStageSections = compose(some(checkIfDirty), programStageSectionsSelector);
const hasDirtyProgramStageSections = compose(some(checkIfDirty), flatten, values, programStageSectionsSelector)

const hasDirtyProgramNotifications = state => programNotificationsSelector(state).isDirty();

// ___ hasDirtyNotificationTemplate :: Object<{programStageNotifications, programStages}> -> Boolean

const hasDirtyNotificationTemplate = compose(some(checkIfDirty), flatten, values, programStageNotificationsSelector)

// ___ hasDirtyDataEntryForms :: Object<StoreState> -> Object<{programStageId: Model.DataEntryForm}> -> Boolean
const hasDirtyDataEntryForms = compose(some(checkIfDirty), values, dataEntryFormsSelector);

// __ isProgramDirty :: Object<{program}> -> Boolean
const isProgramDirty = compose(checkIfDirty, programSelector);

const hasDirtyProgramSections = compose(some(checkIfDirty), values, get('programSections'));

// __ isStoreStateDirty :: StoreState -> Boolean
export const isStoreStateDirty = compose(
    some(identity),
    map(
        __,
        [
            isProgramDirty,
            isProgramStageDirty,
            hasDirtyProgramStageSections,
            hasDirtyNotificationTemplate,
            hasDirtyDataEntryForms,
            hasDirtyProgramNotifications,
            hasDirtyProgramSections
        ]
    ),
    value => func => func(value)
);

// isValidState :: StoreState -> Boolean
function isValidState(state) {
    const acceptedKeys = [
        'program',
        'programStages',
        'programStageToEditCopy',
        'programStageSections',
        'programStageNotifications',
        'programSections',
        'availableDataElements',
        'availableAttributes',
        'renderingOptions',
        'dataEntryFormForProgramStage',
        //'programStageSectionsExtracted' //FIX ME REMOVE
    ];

    return Object
        .keys(state)
        .every(key => some(equals(key), acceptedKeys));
}

/**
 * Contains all the event related d2 models.
 * We can't store these in the redux store since they are mutable objects. This store works similar to the Redux store
 * except it won't be able to do the shallow optimizations that the Redux store allows.
 *
 * The store will contain all the d2 related models, in a normalized fashion.
 *
 * The store contains the following keys
 * program: The event program itself.
 *      - Loaded using the filter id:eq:VBqh0ynB2wv
 * programStages: The stages for the program
 *      - Loaded using the filter = program.id:eq:VBqh0ynB2wv
 * programStageSections The sections for the program it's stages
 *      - Loaded using the filter = programStage.program.id:eq:VBqh0ynB2wv
 * programStageNotifications:
 *      - Notifications pulled from the programStages
 */
/*
 Example query for a program with programStages and programSections

 /api/27/metadata
     ?fields=:owner
     &programs:filter=id:eq:VBqh0ynB2wv&programStages=true
     &programStages:filter=program.id:eq:VBqh0ynB2wv
     &programStages:fields=:owner,notificationTemplates[:owner]
     &programStageSections:filter=programStage.program.id:eq:VBqh0ynB2wv
 */
const eventProgramStore = Store.create();

if (process.env.NODE_ENV === "development") {
    eventProgramStore.subscribe(state => {
        console.log(
            '=====================\nnew store state\n',
            state,
            '\n====================='
        );
    });
}

const storeSetState = eventProgramStore.setState.bind(eventProgramStore);

eventProgramStore.setState = (newState) => {
    if (!isObject(newState)) {
        throw new Error('You are attempting to set a state that is a non object');
    }

    if (!isValidState(newState)) {
        throw new Error('You are attempting to set an invalid state onto the eventProgramStore');
    }

    storeSetState({
        ...eventProgramStore.getState(),
        ...newState,
    });
};

export { getMetaDataToSend }
export default eventProgramStore;
