import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { compose, lifecycle } from 'recompose';

import { getInstance } from 'd2/lib/d2';
import { withProgramStageFromProgramStage$ } from './utils';
import { changeStepperDisabledState } from '../../actions';
import { saveProgramStageEdit, cancelProgramStageEdit, editProgramStageReset } from './actions';
import ProgramStageStepper from './ProgramStageStepper';
import SaveButton from '../../../SaveButton.component';
import CancelButton from '../../../CancelButton.component';

const EditProgramStage = (props, context) => {
    const styles = {
        buttons: {
            padding: '2rem 1rem 1rem',
            marginLeft: '10px',
        },
    };

    return (
        <div>
            <ProgramStageStepper
                programStage$={props.programStage$}
                programStage={props.programStage}
            />
            <div style={styles.buttons}>
                {props.isEditing &&
                    <div
                        style={{
                            padding: '10px 0',
                            fontWeight: 'bold',
                        }}
                    >
                        {context.d2.i18n.getTranslation('stage_save_hint_text')}
                    </div>
                }

                <div>
                    <SaveButton
                        onClick={props.saveProgramStageEdit}
                        label={context.d2.i18n.getTranslation(
                            !props.isEditing
                                ? 'stage_add'
                                : 'stage_update'
                        )}
                    />
                    <CancelButton onClick={props.cancelProgramStageEdit} style={{ marginLeft: '1rem' }} />
                </div>
            </div>
        </div>
    );
}

EditProgramStage.contextTypes = {
  d2: PropTypes.object,
};

export default compose(
    connect(null, dispatch =>
        bindActionCreators(
            {
                changeStepperDisabledState,
                saveProgramStageEdit,
                cancelProgramStageEdit,
                editProgramStageReset,
            },
            dispatch,
        ),
    ),
    lifecycle({
        componentWillMount() {
            this.props.changeStepperDisabledState(true);
        },
        componentWillUnmount() {
            this.props.changeStepperDisabledState(false);
            this.props.editProgramStageReset();
        },
        shouldComponentUpdate(nextProps) {
            /* Do not update if programStage updates, this will make the form loose focus - as
            the component will re-render for every change when the observable changes(due getting a new object
            through withProgramStageFromProgramStage$ HoC. */
            if (
                nextProps.programStage !== this.props.programStage ||
                (!this.props.programStage && !nextProps.programStage)
            ) {
                return false;
            }

            return nextProps !== this.props;
        },
    }),
    withProgramStageFromProgramStage$,
)(EditProgramStage);
