import { previousStep, nextStep } from './stepper.actions';
import {
    createConnectedForwardButton,
    createConnectedBackwardButton,
    createStepperNavigation,
} from './stepper';

const EventProgramStepperNavigationForward = createConnectedForwardButton(nextStep);
const EventProgramStepperNavigationBackward = createConnectedBackwardButton(previousStep);

const ArrowStepperNavigation = createStepperNavigation(
    EventProgramStepperNavigationBackward,
    EventProgramStepperNavigationForward,
);

export default ArrowStepperNavigation;
