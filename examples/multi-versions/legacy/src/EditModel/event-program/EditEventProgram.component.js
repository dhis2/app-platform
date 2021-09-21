import React from 'react';
import PropTypes from 'prop-types';

import { camelCaseToUnderscores } from 'd2-utilizr';
import FormHeading from '../FormHeading';
import FormSubHeading from '../FormSubHeading';
import EventProgramStepper from './EventProgramStepper';
import EventProgramStepperContent from './EventProgramStepperContent';
import eventProgramStore$, { isStoreStateDirty } from './eventProgramStore';
import EventActionButtons from './EventActionButtons';
import {
    createConnectedForwardButton,
    createConnectedBackwardButton,
    createStepperNavigation,
} from '../stepper/stepper';
import { previousStep, nextStep } from './actions';

const EventProgramStepperNavigationForward = createConnectedForwardButton(
    nextStep,
);
const EventProgramStepperNavigationBackward = createConnectedBackwardButton(
    previousStep,
);

const StepperNavigation = createStepperNavigation(
    EventProgramStepperNavigationBackward,
    EventProgramStepperNavigationForward,
);

const styles = {
    heading: {
        display: 'flex',
        flexDirection: 'column',
        marginBottom: '1rem',
    },
};

const isModelDirty = () => ({
    dirty: isStoreStateDirty(eventProgramStore$.getState()),
});

function EditEventProgram(props) {
    const schema = props.params.modelType || 'program';
    const { groupName } = props.params;

    return (
        <div>
            <div style={styles.heading}>
                <FormHeading
                    schema={schema}
                    groupName={groupName}
                    isDirtyHandler={isModelDirty}
                >
                    {`event_${camelCaseToUnderscores(schema)}`}
                </FormHeading>
                <FormSubHeading>
                    {props.model.displayName}
                </FormSubHeading>
            </div>
            <div>
                <EventProgramStepper />
            </div>
            <EventProgramStepperContent schema={schema} {...props} />
            <StepperNavigation>
                <EventActionButtons
                    groupName={groupName}
                    schema={schema}
                    isDirtyHandler={isModelDirty}
                />
            </StepperNavigation>
        </div>
    );
}


EditEventProgram.propTypes = {
    params: PropTypes.object.isRequired,
    isProgramStageStepperActive: PropTypes.bool,
    model: PropTypes.object.isRequired,
};

EditEventProgram.defaultProps = {
    isProgramStageStepperActive: false,
};


export default EditEventProgram;
