import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { createStepperFromConfig } from '../../stepper/stepper';
import { activeStepSelector, disabledSelector } from '../selectors';
import steps from './tracker-program-steps';
import { changeStep } from '../actions';

const mapStateToProps = state => ({
    activeStep: activeStepSelector(state),
    disabled: disabledSelector(state),
});

const mapDispatchToProps = dispatch =>
    bindActionCreators({ stepperClicked: changeStep }, dispatch);
const EventProgramStepper = connect(mapStateToProps, mapDispatchToProps)(
    createStepperFromConfig(steps),
);

export default EventProgramStepper;
