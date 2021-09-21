import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import mapPropsStream from 'recompose/mapPropsStream';
import { first, compose } from 'lodash/fp';
import { createStepperContentFromConfig } from '../stepper/stepper';
import { activeStepSelector } from './selectors';
import eventProgramStore from './eventProgramStore';
import steps from './event-program-steps';
import AssignDataElements from './assign-data-elements/AssignDataElements';
import EditDataEntryForm from './create-data-entry-form/CreateDataEntryForm.component';
import ProgramAccess from './program-access/ProgramAccess';
import EventProgramNotifications from './notifications/EventProgramNotifications';
import { createFieldConfigsFor } from '../formHelpers';
import { editFieldChanged } from './actions';
import { wrapInPaper } from '../componentHelpers';
import fieldOrder from '../../config/field-config/field-order';
import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';
import {editProgramStageField} from "./tracker-program/program-stages/actions";

const eventProgramFields = fieldOrder.for('eventProgram');
const eventProgramStageFields = fieldOrder.for('eventProgramStage');
let ProgramForm = props => (
    <FormBuilder
        fields={props.fieldConfigs}
        onUpdateField={props.editFieldChanged}>
    </FormBuilder>)

ProgramForm = createFieldConfigsFor('program', eventProgramFields, undefined, true, true, 'eventProgram')(ProgramForm);

let ProgramStageForm = props => (
    <FormBuilder
        fields={props.fieldConfigs}
        onUpdateField={props.editProgramStageFieldChange}>
    </FormBuilder>
)
ProgramStageForm = createFieldConfigsFor('programStage', eventProgramStageFields, undefined, null, true, 'eventProgramStage')(ProgramStageForm);
let EditProgramDetailsForm = (props) => (
    <div>
        <ProgramForm model={props.model} editFieldChanged={props.editFieldChanged}/>
        <ProgramStageForm model={props.programStage} editProgramStageFieldChange={props.editProgramStageFieldChange}/>
    </div>)

const mapDispatchToProps = (dispatch, ownProps) =>
    bindActionCreators({
        editFieldChanged,
        editProgramStageFieldChange: (field, value) => editProgramStageField(ownProps.programStage.id, field, value)
    }, dispatch);
EditProgramDetailsForm = connect(null, mapDispatchToProps)(wrapInPaper(EditProgramDetailsForm));

const stepperConfig = () => {
    const stepComponents = {
        EditProgramDetailsForm: EditProgramDetailsForm,
        AssignDataElements,
        EditDataEntryForm,
        ProgramAccess,
        EventProgramNotifications,
    };

    return steps.map(step => {
        step.component = stepComponents[step.componentName]; // eslint-disable-line no-param-reassign
        return step;
    });
};

const mapStateToProps = state => ({
    activeStep: activeStepSelector(state),
});

const EventProgramStepperContent = compose(
    connect(mapStateToProps),
    mapPropsStream(props$ =>
        props$.combineLatest(eventProgramStore, (props, { program, programStages }) => ({
            ...props,
            modelToEdit: program,
            programStage: first(programStages)
        }))
    )
)(createStepperContentFromConfig(stepperConfig()));

export default EventProgramStepperContent;
