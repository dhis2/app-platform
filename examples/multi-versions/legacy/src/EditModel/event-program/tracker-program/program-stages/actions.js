import { createActionCreator } from '../../../actions';
import { notifyUser } from '../../../actions';

export const PROGRAM_STAGE_STEP_CHANGE = 'PROGRAM_STAGE_STEP_CHANGE';
export const PROGRAM_STAGE_STEP_NEXT = 'PROGRAM_STAGE_STEP_NEXT';
export const PROGRAM_STAGE_STEP_PREVIOUS = 'PROGRAM_STAGE_STEP_PREVIOUS';

export const PROGRAM_STAGE_FIELD_EDIT = 'PROGRAM_STAGE_FIELD_EDIT';

export const PROGRAM_STAGE_ADD = 'PROGRAM_STAGE_ADD';
export const PROGRAM_STAGE_EDIT = 'PROGRAM_STAGE_EDIT';
export const PROGRAM_STAGE_EDIT_RESET = 'PROGRAM_STAGE_EDIT_RESET';
export const PROGRAM_STAGE_EDIT_CANCEL = 'PROGRAM_STAGE_EDIT_CANCEL';
export const PROGRAM_STAGE_EDIT_SAVE = 'PROGRAM_STAGE_EDIT_SAVE';

export const CONFIRM_PROGRAM_STAGE_DELETE = 'CONFIRM_PROGRAM_STAGE_DELETE';
export const PROGRAM_STAGE_DELETE = 'PROGRAM_STAGE_DELETE';
export const PROGRAM_STAGE_DELETE_ERROR = 'PROGRAMSTAGE_DELETE_ERROR';
export const PROGRAM_STAGE_DELETE_SUCCESS = 'PROGRAM_STAGE_DELETE_SUCCESS';

export const changeStep = stepKey => ({
    type: PROGRAM_STAGE_STEP_CHANGE,
    payload: {
        stepKey,
    },
});
export const nextStep = () => ({ type: PROGRAM_STAGE_STEP_NEXT });
export const previousStep = () => ({ type: PROGRAM_STAGE_STEP_PREVIOUS });

export const editProgramStage = (stageId, addNewStage = false) => ({
    type: PROGRAM_STAGE_EDIT,
    payload: { stageId, addNewStage },
});

export const addProgramStage = () => ({
    type: PROGRAM_STAGE_ADD,
});

export const editProgramStageReset = () => ({ type: PROGRAM_STAGE_EDIT_RESET });

export const editProgramStageField = (stageId, field, value) => ({
    type: PROGRAM_STAGE_FIELD_EDIT,
    payload: { stageId, field, value },
});

export const saveProgramStageEdit = () => ({ type: PROGRAM_STAGE_EDIT_SAVE });

export const cancelProgramStageEdit = () => ({
    type: PROGRAM_STAGE_EDIT_CANCEL,
});

export const deleteProgramStage = stageId => createActionCreator(PROGRAM_STAGE_DELETE)({ stageId });
export const deleteProgramStageSuccess = () => notifyUser({
    message: 'item_deleted_successfully',
    translate: true,
});

export const deleteProgramStageError = (e) => {
    const message = e && e.message;
    return notifyUser({
        message: message ? message : 'failed_to_save',
        translate: !message
    })
}
export const confirmDeleteProgramStage = stageId => createActionCreator(CONFIRM_PROGRAM_STAGE_DELETE)({ stageId });
