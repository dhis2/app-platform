import { Observable } from 'rxjs';
import { combineEpics } from 'redux-observable';
import { get, getOr, compose, isEqual, findIndex, maxBy, filter, sortBy } from 'lodash/fp';
import { generateUid } from 'd2/lib/uid';
import { getInstance } from 'd2/lib/d2';
import { getProgramStageToModify } from '../assign-data-elements/epics';
import {
    PROGRAM_STAGE_DATA_ELEMENTS_ORDER_CHANGE,
    PROGRAM_STAGE_SECTIONS_ORDER_CHANGE,
    PROGRAM_STAGE_SECTIONS_ADD,
    PROGRAM_STAGE_SECTIONS_REMOVE,
    PROGRAM_STAGE_SECTION_UPDATE,
    PROGRAM_STAGE_DATA_ELEMENTS_ORDER_CHANGE_COMPLETE,
} from './actions';
import { getStageSectionsById, getProgramStageById } from "../tracker-program/program-stages/selectors";

const d2$ = Observable.fromPromise(getInstance());

const changeProgramStageDataElementOrder = store => action$ => action$
        .ofType(PROGRAM_STAGE_DATA_ELEMENTS_ORDER_CHANGE)
        .map((action) => {
            const state = store.getState();
            const programStages = getOr([], 'programStages', state);
            const programStage = getProgramStageToModify(get('payload.programStage', action), programStages);
            const programStageDataElements = getOr([], 'programStageDataElements', programStage);

            const newDataElementOrder = get('payload.newDataElementOrder', action);
            programStage.programStageDataElements = programStageDataElements
                .map((dataElement) => {
                    dataElement.sortOrder = findIndex(id => id === get('dataElement.id', dataElement), newDataElementOrder);

                    return dataElement;
                });

            store.setState({
                programStages,
            });
        })
        .mapTo({ type: PROGRAM_STAGE_DATA_ELEMENTS_ORDER_CHANGE_COMPLETE });

const updateProgramStageSection = store => action$ => action$
        .ofType(PROGRAM_STAGE_SECTION_UPDATE)
        .map((action) => {
            const state = store.getState();
            const programStageId = get('payload.programStage', action);
            const programStageSectionId = get('payload.programStageSectionId', action);
            const newProgramStageSectionData = get('payload.newProgramStageSectionData', action);

            const programStageSections = getStageSectionsById(state, programStageId)
            state.programStageSections[programStageId] = programStageSections.map((section) => {
                    // Modify the original Model instance
                    if (isEqual(section.id, programStageSectionId)) {
                        section.name = newProgramStageSectionData.name;
                        // this is just used to show edited name immediately, not sent to serv
                        // cannot change dispayName directly as it does not have a setter (writable: false)
                        section.dataValues.displayName = newProgramStageSectionData.name;
                        section.description = newProgramStageSectionData.description;
                        section.renderType = newProgramStageSectionData.renderType;
                    }

                    return section;
                });

            store.setState(
                state
            );
        })
        .flatMapTo(Observable.never());

const setSortOrderToIndex = models => models.map((model, index) => {
    model.sortOrder = index;

    return model;
});

const changeProgramStageSectionOrder = store => action$ => action$
        .ofType(PROGRAM_STAGE_SECTIONS_ORDER_CHANGE)
        .map((action) => {
            const state = store.getState();
            const programStageId = get('payload.programStage', action);

            const newSections = get('payload.programStageSections', action);

            const sortedSections = compose(sortBy('sortOrder'), setSortOrderToIndex)(newSections);
            state.programStageSections[programStageId] = sortedSections;

            store.setState(
                state
            );
        })
        .flatMapTo(Observable.never());

const addProgramStageSection = store => action$ => action$
        .ofType(PROGRAM_STAGE_SECTIONS_ADD)
        .combineLatest(d2$, (action, d2) => ([d2, action]))
        .map(([d2, action]) => {
            const state = store.getState();

            const newSectionData = get('payload.newSectionData', action);
            // const newSectionName = get('payload.newSectionName', action);
            const programStageId = get('payload.programStage', action);
            const programStage = getProgramStageById(state, programStageId);

            let programStageSections = getStageSectionsById(state, programStageId);
            const sortOrder = getOr(-1, 'sortOrder', maxBy(section => get('sortOrder', section), programStageSections)) + 1;

            // Create new section model and set the properties we can
            const newSection = d2.models.programStageSection.create({ id: generateUid(), dataElements: [], displayName: newSectionData.name });
            newSection.name = newSectionData.name;
            newSection.description = newSectionData.description;
            newSection.renderType = newSectionData.renderType;
            newSection.sortOrder = sortOrder;

            // Add the section to the programStage, otherwise the section won't be associated with the programStage
            newSection.programStage = programStage;
            // Add the inverse relationship so the section gets associated correctly
            // Using the  programStageSection -> programStage relationship is not sufficient and the programStage -> programStageSection is the required relationship.Th
            programStage.programStageSections.add(newSection);

            //Add empty stageNotifications if its a new programStage
            if(!programStageSections) {
                programStageSections = state.programStageSections[programStageId] = [];
            }
            programStageSections.push(newSection);

            store.setState(state);
        })
        .flatMapTo(Observable.never());


const removeProgramStageSection = store => action$ => action$
        .ofType(PROGRAM_STAGE_SECTIONS_REMOVE)
        .map((action) => {
            // TODO: Update sortOrder? map(section => ({ ...section, sortOrder: section.sortOrder - 1 }), filter(section => section.sortOrder > sortOrderOfDeletedSection, sections));
            const state = store.getState();
            const sectionToDelete = get('payload.programStageSection', action);

            const programStageId = get('payload.programStage', action);
            const programStage = getProgramStageById(state, programStageId);

            const programStageSections = getStageSectionsById(state, programStageId);
            const updatedProgramStageSections = filter(section => !isEqual(sectionToDelete.id, section.id), programStageSections);

            // Remove section from programStage and normalized-store
            programStage.programStageSections.remove(sectionToDelete);
            state.programStageSections[programStageId] = updatedProgramStageSections;
            store.setState(
                state
            );
        })
        .flatMapTo(Observable.never());

export default function createEpicsForStore(store) {
    return combineEpics(
        changeProgramStageDataElementOrder(store),
        updateProgramStageSection(store),
        changeProgramStageSectionOrder(store),
        addProgramStageSection(store),
        removeProgramStageSection(store),
    );
}
