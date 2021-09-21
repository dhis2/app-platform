import {
    PROGRAM_STAGE_DATA_ELEMENTS_ADD,
    PROGRAM_STAGE_DATA_ELEMENTS_REMOVE,
    PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE,
    PROGRAM_STAGE_DATA_ELEMENT_EDIT,
    PROGRAM_STAGE_DATA_ELEMENT_EDIT_COMPLETE,
} from './actions';
import { combineEpics } from 'redux-observable';
import {
    getOr,
    get,
    map,
    find,
    compose,
    isEqual,
    includes,
    negate,
    filter,
    __,
} from 'lodash/fp';
import { generateUid } from 'd2/lib/uid';
import { getStageSectionsById } from "../tracker-program/program-stages/selectors";

// getProgramStageToModify :: String -> ProgramStage[] -> ProgramStage
export const getProgramStageToModify = (
    programStageIdToModify,
    programStages
) => find(compose(isEqual(programStageIdToModify), get('id')), programStages);

const programStageDataElementExistsInDataElementUidList = uids =>
    compose(includes(__, uids), get('dataElement.id'));
const keepProgramStageDataElementsNotInUidList = uids =>
    filter(negate(programStageDataElementExistsInDataElementUidList(uids)));

const getProgramStageByIdFromAction = (store, action) => {
    const programStageIdToModify = get('payload.programStage', action);
    const programStages = getOr([], 'programStages', store.getState());
    return getProgramStageToModify(programStageIdToModify, programStages);
};

const addDataElementsToStage = store => action$ =>
    action$
        .ofType(PROGRAM_STAGE_DATA_ELEMENTS_ADD)
        .map((action) => {
            const state = store.getState();
            const programStageToEdit = getProgramStageByIdFromAction(
                store,
                action,
            );

            const programStageDataElements = getOr(
                [],
                'programStageDataElements',
                programStageToEdit,
            );
            const dataElementIdsToAdd = getOr(
                [],
                'payload.dataElements',
                action,
            );
            // TODO: Simplify this once JIRA issue DHIS2-4207 is done
            // Currently simple saving failed for programStageDataElements that have a renderType
            // Saving in this case only works when a programStage.id and dataElement.id are provided
            let sortOrder = programStageDataElements.length;
            const programStageDataElementsToAdd = map((id) => {
                sortOrder += 1;
                const { optionSet, valueType, displayName } = state.availableDataElements.find(dataElement => dataElement.id === id);
                return {
                    id: generateUid(),
                    dataElement: {
                        id,
                        displayName,
                        optionSet,
                        valueType,
                    },
                    programStage: {
                        id: programStageToEdit.id,
                    },
                    sortOrder,
                };
            }, dataElementIdsToAdd,
            );

            programStageToEdit.programStageDataElements = programStageDataElements.concat(
                programStageDataElementsToAdd,
            );
            const programStages = getOr([], 'programStages', store.getState());
            store.setState({
                ...store.getState(),
                programStages,
            });
        })
        .mapTo({ type: PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE });

const removeDataElementFromStage = store => action$ =>
    action$
        .ofType(PROGRAM_STAGE_DATA_ELEMENTS_REMOVE)
        .map(action => {
            const state = store.getState();
            const programStageToEdit = getProgramStageByIdFromAction(
                store,
                action
            );
            const programStageToEditId = programStageToEdit.id;

            const programStageDataElements = getOr(
                [],
                'programStageDataElements',
                programStageToEdit
            );
            const dataElementIdsToRemove = getOr(
                [],
                'payload.dataElements',
                action
            );

            const removeDataElements = keepProgramStageDataElementsNotInUidList(
                dataElementIdsToRemove
            );

            programStageToEdit.programStageDataElements = removeDataElements(
                programStageDataElements
            );

            // Remove DataElements from any sections that contains the removed DataElements
            let programStageSections = getStageSectionsById(
                state,
                programStageToEditId
            );

            if (
                programStageSections &&
                Object.keys(programStageSections).length > 0
            ) {
                state.programStageSections[
                    programStageToEditId
                ] = programStageSections.map(section => {
                    // CreateDataEntryForm mutates sections and transform their DataElements to an array (from a model)
                    // So we need to support both regular arrays and ModelCollections, which this does
                    const sectionDataElements = Array.from(
                        section.dataElements.values()
                    );
                    const updatedDataElements = sectionDataElements.filter(
                        element => !dataElementIdsToRemove.includes(element.id)
                    );

                    if (
                        section.dataElements.length !==
                        updatedDataElements.length
                    ) {
                        section.dataElements = updatedDataElements;
                    }
                    return section;
                });
            }

            const programStages = getOr([], 'programStages', store.getState());
            store.setState({
                ...store.getState(),
                programStages,
            });
        })
        .mapTo({ type: PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE });

const isObjectHasId = id => compose(isEqual(id), get('id'));

const editProgramStageDataElement = store => action$ =>
    action$
        .ofType(PROGRAM_STAGE_DATA_ELEMENT_EDIT)
        .map(action => {
            const programStageDataElementId = get(
                'payload.programStageDataElement.id',
                action
            );
            const programStageToEdit = getProgramStageByIdFromAction(
                store,
                action
            );

            const programStageDataElements = getOr(
                [],
                'programStageDataElements',
                programStageToEdit
            );
            const programStageDataElement = programStageDataElements.find(
                isObjectHasId(programStageDataElementId)
            );

            programStageToEdit.programStageDataElements = programStageDataElements.map(
                value => {
                    if (programStageDataElement === value) {
                        return action.payload.programStageDataElement;
                    }
                    return value;
                }
            );
            const programStages = getOr([], 'programStages', store.getState());
            store.setState({
                ...store.getState(),
                programStages,
            });
        })
        .mapTo({ type: PROGRAM_STAGE_DATA_ELEMENT_EDIT_COMPLETE });

export default function createEpicsForStore(store) {
    return combineEpics(
        addDataElementsToStage(store),
        removeDataElementFromStage(store),
        editProgramStageDataElement(store)
    );
}
