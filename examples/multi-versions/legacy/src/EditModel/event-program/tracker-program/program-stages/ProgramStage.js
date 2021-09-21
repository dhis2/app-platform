import React, { Component } from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';

import ProgramStageList from './ProgramStageList';
import EditProgramStage from './EditProgramStage';
import { editProgramStage } from './actions';
import { getProgramStageById$, firstProgramStage$, withProgramAndStages } from './utils';
import { 
    getCurrentProgramStageId,
    getIsStageBeingEdited,
} from './selectors';

class ProgramStage extends Component {
    shouldComponentUpdate(nextProps) {
        return nextProps.programStage === this.props.programStage;
    }

    render() {
        const props = this.props;

        const programStage$ =
            props.currentProgramStageId !== 'add' &&
            getProgramStageById$(props.currentProgramStageId).defaultIfEmpty(
                firstProgramStage$,
            );

        return (
            <div>
                {this.props.currentProgramStageId
                    ? <EditProgramStage
                        programStage$={programStage$}
                        isEditing={props.isEditing}
                    />
                    : <ProgramStageList
                        program={props.program}
                        programStages={props.programStages}
                    />}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    currentProgramStageId: getCurrentProgramStageId(state),
    isEditing: getIsStageBeingEdited(state),
});

const mapDispatchToProps = dispatch => ({
    editProgramStage(id) {
        dispatch(editProgramStage(id));
    },
});

ProgramStage.propTypes = {
    programStage: PropTypes.object,
    currentProgramStageId: PropTypes.string,
};

ProgramStage.defaultProps = {
    currentProgramStageId: '',
    programStage: {},
};


export default compose(
    connect(mapStateToProps, mapDispatchToProps),
    withProgramAndStages,
)(ProgramStage);
