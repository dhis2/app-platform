import { curry, get } from 'lodash/fp';

export const getCurrentProgramStageId = state =>
    state.eventProgram.programStageStepper.stageId;

export const getActiveProgramStageStep = state =>
    state.eventProgram.programStageStepper.activeStep;

export const isProgramStageStepperActive = state =>
    !!state.eventProgram.programStageStepper.stageId;

export const getProgramStageById = curry((store, stageId) =>
    store.programStages.find(stage => stage.id === stageId)
);

export const getProgramStageIndexById = curry((store, stageId) =>
    store.programStages.findIndex(stage => stage.id === stageId)
);

export const getStageSectionsById = curry((state, id) => {
    const { programStageSections } = state;

    return get(id, programStageSections);
});

export const getIsStageBeingEdited = state =>
    state.eventProgram.programStageStepper.mode === 'edit';

export const getMaxSortOrder = (store) => (store.programStages.reduce((max, curr) => Math.max(max, curr.sortOrder), 0));
