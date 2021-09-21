// TODO: Move this to d2-ui
import React from 'react';
import Stepper from 'material-ui/Stepper/Stepper';
import StepButton from 'material-ui/Stepper/StepButton';
import StepContent from 'material-ui/Stepper/StepContent';
import Step from 'material-ui/Stepper/Step';
import IconButton from 'material-ui/IconButton/IconButton';
import ForwardIcon from 'material-ui/svg-icons/navigation/arrow-forward';
import BackwardIcon from 'material-ui/svg-icons/navigation/arrow-back';
import Translate from 'd2-ui/lib/i18n/Translate.component';
import log from 'loglevel';
import { isString, isNumber } from 'lodash/fp';

// TODO: Redux helpers, leave these here
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import fieldGroups from '../../config/field-config/field-groups';

function isActiveStep(activeStep, step, index) {
    if (isString(activeStep)) {
        return activeStep === step.key;
    }

    return activeStep === index;
}

export const getStepFields = (step, fieldConfigs, modelType) => {
    const stepsByField = fieldGroups.groupsByField(modelType);
    if (stepsByField) {
        fieldConfigs.map(field => {
            if (
                stepsByField[field.name] === step ||
                (field.isAttribute && step === 0) // add custom attributes-fields to first step
            ) {
                field.props.style = { display: 'block' };
            } else {
                field.props.style = { display: 'none' };
            }
            return field;
        });
    }
    return [...fieldConfigs];
};

export const createStepper = ({ steps, activeStep, stepperClicked, orientation = 'horizontal'}, ) => (
    <Stepper
        activeStep={activeStep}
        linear={false}
        orientation={orientation}
        style={{ margin: '0 -16px' }}
    >
        {steps.map((step, index) => (
            <Step key={step.label}>
                <StepButton onClick={() => stepperClicked(index)}><Translate>{step.label}</Translate></StepButton>
            </Step>
        ))}
    </Stepper>
);

/**
 * Create a Stepper component from a configuration object.
 *
 * @param {Array} stepperConfig Config array that defines the steps that should be shown.
 * @param {String} [orientation='horizontal'] The orientation in which to render the Stepper.
 *
 * @returns {ReactComponent} A React component that will render the steps as defined by the `stepperConfig`
 *
 * @example
 * ```
 * const steps = [
 *      { key: 'first', name: 'First step!' },
 *      { key: 'last', name: 'My last step!' },
 * ];
 * const MyStepperComponent = createStepperFromConfig(steps)
 *
 * // <MyStepperComponent activeStep={activeStep.key} />
 * ```
 */
export const createStepperFromConfig = (stepperConfig, orientation = 'horizontal') => ({ activeStep, stepperClicked, disabled, ...props }) => {
    const getStepChildren = (step) => {
        const stepChildren = [];

        stepChildren.push(<StepButton key="button" onClick={() => stepperClicked(step.key)}><Translate>{step.name}</Translate></StepButton>);

        if (step.content) {
            stepChildren.push(<StepContent key="content"><step.content {...props} /></StepContent>);
        }

        return stepChildren;
    };

    return (
        <Stepper linear={false} orientation={orientation} activeStep={isNumber(activeStep) ? activeStep : undefined}>
            {stepperConfig.map((step, index) => (
                <Step key={step.key} active={isActiveStep(activeStep, step, index)} disabled={!!disabled}>
                    {getStepChildren(step)}
                </Step>
            ))}
        </Stepper>
    );
};

/**
 * Create a StepperContent component from a configuration object. The StepperContent component renders the content that
 * belongs to the current `activeStep`. When the config does not specify a `component` property for the current active
 * step a warning is logged and `null` is rendered.
 * The `component` is passed all the props passed to the StepperContent.
 *
 * @param {Array} stepperConfig Config array that defines the steps and the components that should be rendered for the
 * currently active step.
 *
 * @returns {ReactComponent} A React component that will render the `component` property of the currently active step.
 */
export const createStepperContentFromConfig = stepperConfig => ({ activeStep, ...props }) => {
    const step = stepperConfig.find(stepConfig => stepConfig.key === activeStep);

    if (step && step.component) {
        return <step.component {...props} />;
    }

    if (activeStep) {
        log.warn(`Could not find a content component for a step with key (${activeStep}) in`, stepperConfig);
    } else {
        log.warn('The `activeStep` prop is undefined, therefore the component created by `createStepperContentFromConfig` will render null');
    }

    return null;
};

export function StepperNavigationBack({ onBackClick }) {
    return (
        <IconButton onClick={onBackClick}>
            <BackwardIcon />
        </IconButton>
    );
}

export function StepperNavigationForward({ onForwardClick }) {
    return (
        <IconButton onClick={onForwardClick}>
            <ForwardIcon />
        </IconButton>
    );
}

export function createStepperNavigation(BackwardButton, ForwardButton) {
    const styles = {
        buttons: {
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: '4rem 1rem 1rem',
        },
    };

    const StepperNavigation = ({ children }) => (
        <div style={styles.buttons}>
            <BackwardButton />
            {children}
            <ForwardButton />
        </div>
    );

    return StepperNavigation;
}

// ////////////////////////////////////////////////////////////////
// Redux specfic helpers, don't move to

const mapDispatchToProps = actionCreators => dispatch => bindActionCreators(actionCreators, dispatch);

export const createConnectedForwardButton = nextStepActionCreator => connect(undefined, mapDispatchToProps({ onForwardClick: nextStepActionCreator }))(StepperNavigationForward);
export const createConnectedBackwardButton = previousStepAcionCreator => connect(undefined, mapDispatchToProps({ onBackClick: previousStepAcionCreator }))(StepperNavigationBack);
