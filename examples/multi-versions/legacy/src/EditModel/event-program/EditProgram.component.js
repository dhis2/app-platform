import { connect } from 'react-redux';
import React from 'react';
import { compose, branch, renderComponent } from 'recompose';
import mapPropsStream from 'recompose/mapPropsStream';

import eventProgramStore$ from './eventProgramStore';
import EditEventProgram from './EditEventProgram.component';
import EditTrackerProgram from './tracker-program/EditTrackerProgram';
import LoadingMask from '../../loading-mask/LoadingMask.component';
import { isProgramStageStepperActive } from './tracker-program/program-stages/selectors';

const mapStateToProps = state => ({
    isLoading: state.eventProgram.step.isLoading,
    isProgramStageStepperActive: isProgramStageStepperActive(state),
});

const spinnerWhileLoading = isLoading =>
    branch(isLoading, renderComponent(LoadingMask));

const enhance = compose(
    connect(mapStateToProps),
    mapPropsStream(props$ =>
        props$.combineLatest(
            eventProgramStore$,
            (props, eventProgramState) => ({
                ...props,
                model: eventProgramState.program,
            }),
        ),
    ),
    spinnerWhileLoading(props => props.isLoading),
);

function EditProgram(props) {
    return props.model.programType === 'WITH_REGISTRATION'
        ? <EditTrackerProgram {...props} />
        : <EditEventProgram {...props} />;
}

export default enhance(EditProgram);
