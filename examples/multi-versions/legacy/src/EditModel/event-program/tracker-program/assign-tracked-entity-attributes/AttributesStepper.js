/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { createStepperFromConfig } from '../../../stepper/stepper';
import AssignAttributes from './AssignAttributes';
import CreateEnrollmentDataEntryForm from './data-entry-form/CreateEnrollmentDataEntryForm';
import { withAttributes } from './AssignAttributes';

const steps = [
    {
        key: 'assign_attributes',
        name: 'assign_attributes',
        componentName: 'AssignAttributes',
    },
    {
        key: 'create_registration_form',
        name: 'create_registration_form',
        componentName: 'CreateEnrollmentDataEntryForm',
    },
]

const stepperConfig = () => {
    const stepComponents = {
        AssignAttributes,
        CreateEnrollmentDataEntryForm,
    };

    return steps.map(step => {
        step.component = stepComponents[step.componentName];
        step.content = stepComponents[step.componentName];
        return step;
    });
};

const Stepper = createStepperFromConfig(stepperConfig(), 'vertical');
const StepperWithAttributes = withAttributes(Stepper)

class AttributesStepper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activeStep: 0,
        };

    }
    changeStep = step => {
        this.setState({ activeStep: step });
    };

    render() {
        return (
            <StepperWithAttributes
                {...this.props}
                activeStep={this.state.activeStep}
                stepperClicked={this.changeStep}
            />
        );
    }
}

export default AttributesStepper;
