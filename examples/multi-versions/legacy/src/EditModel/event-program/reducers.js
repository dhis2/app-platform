import { combineReducers } from 'redux';
import {
    EVENT_PROGRAM_STEP_CHANGE,
    EVENT_PROGRAM_STEP_NEXT,
    EVENT_PROGRAM_STEP_PREVIOUS,
    EVENT_PROGRAM_LOAD_SUCCESS,
    PROGRAM_STEPPER_SET_DISABLE,
    EVENT_PROGRAM_SAVE,
    EVENT_PROGRAM_SAVE_SUCCESS,
    EVENT_PROGRAM_SAVE_ERROR,
    TRACKER_PROGRAM_STEP_NEXT,
    TRACKER_PROGRAM_STEP_PREVIOUS,
} from './actions';
import { STEPPER_RESET_ACTIVE_STEP } from '../stepper/stepper.actions';
import { stageNotificationsReducer } from './notifications/reducers';
import { programStageStepperReducer } from './tracker-program/program-stages/reducer';
import eventSteps from './event-program-steps';
import trackerSteps from './tracker-program/tracker-program-steps';
import { next, previous, first } from '../stepper/stepIterator';

export const initialState = {
    activeStep: first(eventSteps),
    disabled: false,
    isLoading: true,
    isSaving: false,
};

/*  TODO should probably have its own reducer for trackerPrograms.
    first(eventSteps) works just because the key of both steppers are "details". */
function eventProgramStepperReducer(state = initialState, action) {
    switch (action.type) {
        case EVENT_PROGRAM_STEP_CHANGE:
            return {
                ...state,
                activeStep: action.payload,
            };

        case EVENT_PROGRAM_STEP_NEXT:
            return {
                ...state,
                activeStep: next(eventSteps, state.activeStep),
            };

        case EVENT_PROGRAM_STEP_PREVIOUS:
            return {
                ...state,
                activeStep: previous(eventSteps, state.activeStep),
            };

        case TRACKER_PROGRAM_STEP_NEXT:
            return {
                ...state,
                activeStep: next(trackerSteps, state.activeStep),
            };

        case TRACKER_PROGRAM_STEP_PREVIOUS:
            return {
                ...state,
                activeStep: previous(trackerSteps, state.activeStep),
            };

        case STEPPER_RESET_ACTIVE_STEP:
            return {
                ...state,
                activeStep: first(eventSteps),
                isLoading: true,
            };
        case EVENT_PROGRAM_LOAD_SUCCESS:
            return {
                ...state,
                isLoading: false,
            };
        case PROGRAM_STEPPER_SET_DISABLE:
            return {
                ...state,
                disabled: action.payload.disabled,
            };
        case EVENT_PROGRAM_SAVE:
            return {
                ...state,
                isSaving: true,
            };

        case EVENT_PROGRAM_SAVE_ERROR:
        case EVENT_PROGRAM_SAVE_SUCCESS:
            return {
                ...state,
                isSaving: false,
            };
        default:
            break;
    }

    return state;
}

export default combineReducers({
    step: eventProgramStepperReducer,
    stageNotifications: stageNotificationsReducer,
    programStageStepper: programStageStepperReducer,
});
