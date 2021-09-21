export const PROGRAM_STAGE_DATA_ENTRY_FORM_FIELD_CHANGED = 'PROGRAM_STAGE_DATA_ENTRY_FORM_FIELD_CHANGED';
export const PROGRAM_STAGE_DATA_ENTRY_FORM_REMOVE = 'PROGRAM_STAGE_DATA_ENTRY_FORM_REMOVE';

export const dataEntryFormChanged = (programStageId, field, value) => ({ type: PROGRAM_STAGE_DATA_ENTRY_FORM_FIELD_CHANGED, payload: { programStage: programStageId, field, value } });

export const dataEntryFormRemove = programStageId => ({ type: PROGRAM_STAGE_DATA_ENTRY_FORM_REMOVE, payload: programStageId });

export const PROGRAM_DATA_ENTRY_FORM_FIELD_CHANGED = 'PROGRAM_DATA_ENTRY_FORM_FIELD_CHANGED';
export const PROGRAM_DATA_ENTRY_FORM_REMOVE = 'PROGRAM_DATA_ENTRY_FORM_REMOVE';

export const programDataEntryFormChanged = (field, value) => ({ type: PROGRAM_DATA_ENTRY_FORM_FIELD_CHANGED, payload: { field, value } });

export const programDataEntryFormRemove = programId => ({ type: PROGRAM_DATA_ENTRY_FORM_REMOVE, payload: programId });
