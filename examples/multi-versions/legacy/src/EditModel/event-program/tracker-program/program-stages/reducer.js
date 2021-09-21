import {
    PROGRAM_STAGE_STEP_CHANGE,
    PROGRAM_STAGE_STEP_NEXT,
    PROGRAM_STAGE_STEP_PREVIOUS,
    PROGRAM_STAGE_EDIT,
    PROGRAM_STAGE_EDIT_RESET,
} from './actions';
import { STEPPER_RESET_ACTIVE_STEP } from '../../../stepper/stepper.actions';
import steps from './programStageSteps';
import { next, previous, first } from '../../../stepper/stepIterator';

export function programStageStepperReducer(
    state = {
        activeStep:
        first(steps),
        stageId: null,
        mode: 'none',
    },
    action,
) {
    switch (action.type) {
    case PROGRAM_STAGE_STEP_CHANGE:
        return {
            ...state,
            activeStep: action.payload.stepKey,
        };

    case PROGRAM_STAGE_STEP_NEXT:
        return {
            ...state,
            activeStep: next(steps, state.activeStep),
        };

    case PROGRAM_STAGE_STEP_PREVIOUS:
        return {
            ...state,
            activeStep: previous(steps, state.activeStep),
        };

    case STEPPER_RESET_ACTIVE_STEP:
        return {
            ...state,
            activeStep: first(steps),
        };

    case PROGRAM_STAGE_EDIT:
        return {
            ...state,
            stageId: action.payload.stageId,
            mode: action.payload.addNewStage
                ? 'add'
                : 'edit',
        };

    case PROGRAM_STAGE_EDIT_RESET:
        return {
            ...state,
            activeStep: first(steps),
            stageId: null,
            mode: 'none',
        };
    default:
        break;
    }

    return state;
}

export default programStageStepperReducer;
