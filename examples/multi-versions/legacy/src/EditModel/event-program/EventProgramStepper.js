import { createStepperFromConfig } from '../stepper/stepper';
import { activeStepSelector } from './selectors';
import { connect } from 'react-redux';
import steps from './event-program-steps';
import { changeStep } from './actions';
import { bindActionCreators } from 'redux';

const mapStateToProps = state => ({
    activeStep: activeStepSelector(state),
});

const mapDispatchToProps = dispatch => bindActionCreators({ stepperClicked: changeStep }, dispatch);
const EventProgramStepper = connect(mapStateToProps, mapDispatchToProps)(createStepperFromConfig(steps));

export default EventProgramStepper;
