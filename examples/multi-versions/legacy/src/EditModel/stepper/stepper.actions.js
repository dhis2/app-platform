import { createActionCreator } from '../actions';

// Stepper
export const STEPPER_STEP_CHANGE = 'STEPPER_STEP_CHANGE';
export const STEPPER_STEP_NEXT = 'STEPPER_STEP_NEXT';
export const STEPPER_STEP_PREVIOUS = 'STEPPER_STEP_PREVIOUS';

export const changeStep = createActionCreator(STEPPER_STEP_CHANGE);
export const nextStep = createActionCreator(STEPPER_STEP_NEXT);
export const previousStep = createActionCreator(STEPPER_STEP_PREVIOUS);

export const STEPPER_RESET_ACTIVE_STEP = 'STEPPER_RESET_ACTIVE_STEP';
export const resetActiveStep = createActionCreator(STEPPER_RESET_ACTIVE_STEP);
