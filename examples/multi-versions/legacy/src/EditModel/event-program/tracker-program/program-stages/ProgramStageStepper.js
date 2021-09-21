/* eslint-disable no-param-reassign */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import pure from 'recompose/pure';
import { bindActionCreators } from 'redux';

import steps from './programStageSteps';
import { changeStep } from './actions';
import { createStepperFromConfig } from '../../../stepper/stepper';
import EditProgramStageDetails from './EditProgramStageDetails';
import AssignProgramStageDataElements from './AssignProgramStageDataElements';
import CreateDataEntryFormWithoutMargin from '../../create-data-entry-form/CreateDataEntryForm.component';
import { getActiveProgramStageStep } from './selectors';

const CreateDataEntryForm = props =>
    (<div style={{ marginTop: '15px' }}>
        <CreateDataEntryFormWithoutMargin {...props} />
    </div>);

const stepperConfig = () => {
    const stepComponents = {
        EditProgramStageDetails,
        AssignProgramStageDataElements,
        CreateDataEntryForm,
    };

    return steps.map((step) => {
        step.component = stepComponents[step.componentName];
        step.content = stepComponents[step.componentName];
        return step;
    });
};

const ProgramStageVerticalStepper = connect(
    state => ({
        activeStep: getActiveProgramStageStep(state),
    }),
    dispatch => bindActionCreators({ stepperClicked: changeStep }, dispatch),
)(createStepperFromConfig(stepperConfig(), 'vertical'));

export const ProgramStageStepper = pure(props => (
    <div>
        <ProgramStageVerticalStepper
            programStage$={props.programStage$}
            programStage={props.programStage}
        />
    </div>
));

ProgramStageStepper.propTypes = {
    /**
     * Programstage observable, needed to create custom forms
     */
    programStage$: PropTypes.object.isRequired,
    /**
     * Programstage-model object
     */
    programStage: PropTypes.object,
};

export default ProgramStageStepper;
