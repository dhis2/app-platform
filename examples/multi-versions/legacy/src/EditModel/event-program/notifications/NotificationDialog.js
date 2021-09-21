import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import branch from 'recompose/branch';
import renderNothing from 'recompose/renderNothing';
import { modelToEditSelector } from './selectors';
import { isProgramNotification } from './selectors';
import { programStageSteps, programSteps } from './NotificationSteps';
import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';
import withState from 'recompose/withState';
import compose from 'recompose/compose';
import withProps from 'recompose/withProps';
import { createStepperFromConfig } from '../../stepper/stepper';
import {
    setEditModel,
    saveStageNotification,
    saveProgramNotification,
} from './actions';
import {
    getProgramStageDataElementsByStageId,
    getNotificationType,
} from './selectors';
import Subheader from 'material-ui/Subheader/';
import { branchWithMessage } from '../../../Snackbar/snackBarUtils';

const withStepper = compose(
    withState('activeStep', 'setActiveStep', 0),
    withProps(({ setActiveStep, dataElements }) => ({
        stepperClicked(stepKey) {
            setActiveStep(
                programStageSteps.findIndex(step => step.key === stepKey)
            );
        },
        dataElements,
    }))
);

const stepperForSteps = steps =>
    withStepper(createStepperFromConfig(steps, 'vertical'));

const ProgramStageStepper = stepperForSteps(programStageSteps);
const ProgramStepper = stepperForSteps(programSteps);

const notificationDialogStyle = {
    content: {
        width: '60%',
        minWidth: 700,
        maxWidth: 'none',
    },
    titleStyle: {
        fontWeight: 400,
        margin: 0,
    },
};

const DialogTitle = props => {
    return (
        <div style={{ ...props.style, paddingBottom: 10 }}>
            <h3 style={notificationDialogStyle.titleStyle}>
                {props.title}
            </h3>
            <Subheader>
                {props.subtitle}
            </Subheader>
        </div>
    );
};

const NotificationDialog = (
    {
        model,
        onCancel,
        onConfirm,
        dataElements,
        isTracker,
        isProgram,
        ...props
    },
    { d2 }
) => {
    const t = d2.i18n.getTranslation.bind(d2.i18n);
    const stepperProps = {
        attributes: isTracker
            ? props.program.programTrackedEntityAttributes
            : [],
        programStages: props.programStages,
        dataElements,
        isTracker,
        isProgram,
    };
    const actions = [
        <FlatButton label={t('cancel')} primary onTouchTap={onCancel} />,
        <FlatButton
            label={t('done')}
            primary
            onTouchTap={() => onConfirm(model)}
        />,
    ];
    const title = `${!isTracker || isProgram
        ? t('program_notification')
        : t('program_stage_notification')}`;
    const StepperComponent = isProgram ? ProgramStepper : ProgramStageStepper;
    return (
        <Dialog
            actions={actions}
            open={!!model}
            onRequestClose={onCancel}
            title={<DialogTitle title={title} subtitle={model.displayName} />}
            autoDetectWindowHeight={true}
            repositionOnUpdate={false}
            autoScrollBodyContent
            contentStyle={notificationDialogStyle.content}
            style={{ paddingTop: 0 }}
        >
            <StepperComponent {...stepperProps} />
        </Dialog>
    );
};
NotificationDialog.contextTypes = {
    d2: PropTypes.object,
};
NotificationDialog.propTypes = {
    model: PropTypes.object.isRequired,
    onCancel: PropTypes.func.isRequired,
    onConfirm: PropTypes.func.isRequired,
    dataElements: PropTypes.array,
    isTracker: PropTypes.bool,
    isProgram: PropTypes.bool,
};

NotificationDialog.defaultProps = {
    isProgram: false,
    isTracker: false,
};

const mapStateToProps = (
    state,
    { model, availableDataElements, programStages, dataElements }
) => {

    const selectedPSId =
        (model && model.programStage && model.programStage.id) ||
        (programStages.length > 0 && programStages[0].id) ||
        null;

    return {
        model,
        dataElements:
            dataElements ||
            getProgramStageDataElementsByStageId({
                availableDataElements,
                programStages,
            })(selectedPSId),
    };
};
const mapDispatchToPropsForDialog = dispatch =>
    bindActionCreators(
        {
            onCancel: setEditModel.bind(null, null),
            onConfirm: saveStageNotification,
        },
        dispatch
    );

export const ProgramStageNotificationDialog = compose(
    branchWithMessage(({ programStages }) => programStages && programStages.length < 1, {
        message: 'cannot_create_program_notification_without_program_stage',
        translate: true,
    }),
    connect(mapStateToProps, mapDispatchToPropsForDialog)
)(NotificationDialog);

export const ProgramNotificationDialog = connect(null, dispatch =>
    bindActionCreators(
        {
            onCancel: setEditModel.bind(null, null),
            onConfirm: saveProgramNotification,
        },
        dispatch
    )
)(NotificationDialog);

/* Chooses what dialog to display according to isProgram prop */
export const NotificationDialogChooser = props =>
    props.isProgram
        ? <ProgramNotificationDialog
              {...props}
              dialogStyle={notificationDialogStyle}
          />
        : <ProgramStageNotificationDialog
              {...props}
              dialogStyle={notificationDialogStyle}
          />;

export const EnhancedDialog = compose(
    connect(state => ({
        notificationType: getNotificationType(state),
        isProgram: isProgramNotification(state),
        model: modelToEditSelector(state),
    })),
    branch(({ model }) => !model, renderNothing)
)(NotificationDialogChooser);

export default EnhancedDialog;
