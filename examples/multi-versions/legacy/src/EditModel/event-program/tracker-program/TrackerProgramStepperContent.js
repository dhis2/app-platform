import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import mapPropsStream from 'recompose/mapPropsStream';
import { get, compose } from 'lodash/fp';

import { createStepperContentFromConfig } from '../../stepper/stepper';
import { activeStepSelector } from '../selectors';
import programStore from '../eventProgramStore';
import steps from './tracker-program-steps';
import EditDataEntryForm from '../create-data-entry-form/CreateDataEntryForm.component';
import ProgramAccess from '../program-access/ProgramAccess';
import TrackerProgramNotifications from '../notifications/TrackerProgramNotifications';
import { createFormFor } from '../../formHelpers';
import { editFieldChanged } from '../actions';
import { flattenRouterProps, wrapInPaper } from '../../componentHelpers';
import fieldOrder from '../../../config/field-config/field-order';
import AttributesStepper from './assign-tracked-entity-attributes/AttributesStepper';
import ProgramStage from './program-stages/ProgramStage';
import EnrollmentDetails from './EnrollmentStep';
const stepperConfig = () => {
    const program$ = programStore.map(get('program'));

    const mapDispatchToProps = dispatch =>
        bindActionCreators({ editFieldChanged }, dispatch);

    const connectEditForm = compose(
        flattenRouterProps,
        connect(null, mapDispatchToProps),
    );
    const trackerDetailsFields = fieldOrder.for('trackerProgram');

    const stepComponents = {
        EditProgramDetailsForm: connectEditForm(
            wrapInPaper(
                createFormFor(program$, 'program', trackerDetailsFields, true, 'trackerProgram'),
            ),
        ),
        Enrollment: EnrollmentDetails,
        AttributesStepper,
        ProgramStage,
        EditDataEntryForm,
        ProgramAccess,
        TrackerProgramNotifications,
    };

    return steps.map((step) => {
        step.component = stepComponents[step.componentName]; // eslint-disable-line no-param-reassign
        return step;
    });
};

const mapStateToProps = state => ({
    activeStep: activeStepSelector(state),
});

const TrackerProgramStepperContent = compose(
    connect(mapStateToProps),
    mapPropsStream(props$ =>
        props$.combineLatest(programStore, (props, { program }) => ({
            ...props,
            modelToEdit: program,
        })),
    ),
)(createStepperContentFromConfig(stepperConfig()));

export default TrackerProgramStepperContent;
