import { createActionCreator } from '../actions';

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Stepper
export const EVENT_PROGRAM_STEP_CHANGE = 'EVENT_PROGRAM_STEP_CHANGE';
export const EVENT_PROGRAM_STEP_NEXT = 'EVENT_PROGRAM_STEP_NEXT';
export const EVENT_PROGRAM_STEP_PREVIOUS = 'EVENT_PROGRAM_STEP_PREVIOUS';

export const TRACKER_PROGRAM_STEP_NEXT = 'TACKER_PROGRAM_STEP_NEXT';
export const TRACKER_PROGRAM_STEP_PREVIOUS = 'TRACKER_PROGRAM_STEP_PREVIOUS';

export const PROGRAM_STEPPER_SET_DISABLE = 'PROGRAM_STEPPER_SET_DISABLE';


export const changeStepperDisabledState = disabled => ({ type: PROGRAM_STEPPER_SET_DISABLE, payload: { disabled } });

export const changeStep = stepKey => ({ type: EVENT_PROGRAM_STEP_CHANGE, payload: stepKey });
export const nextStep = () => ({ type: EVENT_PROGRAM_STEP_NEXT });
export const previousStep = () => ({ type: EVENT_PROGRAM_STEP_PREVIOUS });

export const nextTrackerStep = () => ({ type: TRACKER_PROGRAM_STEP_NEXT });
export const previousTrackerStep = () => ({ type: TRACKER_PROGRAM_STEP_PREVIOUS });

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Model
export const MODEL_TO_EDIT_LOADED = 'MODEL_TO_EDIT_LOADED';
export const MODEL_TO_EDIT_FIELD_CHANGED = 'MODEL_TO_EDIT_FIELD_CHANGED';

export const editFieldChanged = (field, value) => ({ type: MODEL_TO_EDIT_FIELD_CHANGED, payload: { field, value } });

// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Event program
export const EVENT_PROGRAM_LOAD = 'EVENT_PROGRAM_LOAD';
export const EVENT_PROGRAM_LOAD_SUCCESS = 'EVENT_PROGRAM_LOAD_SUCCESS';
export const EVENT_PROGRAM_LOAD_ERROR = 'EVENT_PROGRAM_LOAD_ERROR';

export const loadEventProgram = createActionCreator(EVENT_PROGRAM_LOAD);
export const loadEventProgramSuccess = createActionCreator(EVENT_PROGRAM_LOAD_SUCCESS);
export const loadEventProgramFailure = createActionCreator(EVENT_PROGRAM_LOAD_ERROR);

export const EVENT_PROGRAM_SAVE = 'EVENT_PROGRAM_SAVE';
export const EVENT_PROGRAM_SAVE_SUCCESS = 'EVENT_PROGRAM_SAVE_SUCCESS';
export const EVENT_PROGRAM_SAVE_ERROR = 'EVENT_PROGRAM_SAVE_ERROR';

export const saveEventProgram = createActionCreator(EVENT_PROGRAM_SAVE);
export const saveEventProgramSuccess = createActionCreator(EVENT_PROGRAM_SAVE_SUCCESS);
export const saveEventProgramError = createActionCreator(EVENT_PROGRAM_SAVE_ERROR);
