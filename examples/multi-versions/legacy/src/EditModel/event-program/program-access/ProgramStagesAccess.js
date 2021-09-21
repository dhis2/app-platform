import React from 'react';
import PropTypes from 'prop-types';
import ListItem from 'material-ui/List/ListItem';
import Divider from 'material-ui/Divider';
import ArrowDownwardIcon from 'material-ui/svg-icons/navigation/arrow-downward';
import WarningIcon from 'material-ui/svg-icons/alert/warning';
import { Checkbox } from 'material-ui';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { editFieldChanged } from '../actions';
import { editProgramStageField } from '../tracker-program/program-stages/actions';
import Toolbar from './Toolbar';
import {
    areSharingPropertiesSimilar,
    generateSharingDescription,
} from './utils';
import { yellow800 } from 'material-ui/styles/colors';

const styles = {
    container: {
        paddingTop: 32,
        display: 'flex',
        flexDirection: 'column',
    },
    vertical: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    horizontal: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    programHeading: {
        padding: '5px 0px',
    },
    accessDescription: {
        color: '#aaa',
        fontWeight: 400,
        overflow: 'hidden',
    },
    programStageList: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    warningIcon: {
        top: '22px',
        height: '32px',
        width: '32px',
    },
    stageSharingItem: {
        height: '80px',
    },
};

const sharingFields = ['publicAccess', 'userAccesses', 'userGroupAccesses'];

class ProgramStagesAccess extends React.Component {
    constructor(props) {
        super(props);

        // Get (supersets of) sharing structures
        const programSharing = this.props.model.dataValues;
        const stagesSharing = Array.from(
            this.props.model.dataValues.programStages.valuesContainerMap,
        ).map(stage => stage[1]);

        // Pre-select stages with similar sharing settings as program
        const selectedStages = [];
        const stagesWithSimilarAccessAsProgram = [];
        stagesSharing.forEach(stage => {
            if (areSharingPropertiesSimilar(programSharing, stage)) {
                stagesWithSimilarAccessAsProgram.push(stage.id);
                selectedStages.push(stage.id);
            }
        });

        this.state = {
            sharingDialogOpen: false,
            stagesSharing,
            programSharing,
            selectedStages,
            stagesWithSimilarAccessAsProgram,
        };
    }

    translate = s => this.context.d2.i18n.getTranslation(s);

    toggleStageSelection = id => (_, isChecked) => {
        this.setState(
            {
                selectedStages: isChecked
                    ? [...this.state.selectedStages, id]
                    : this.state.selectedStages.filter(stage => stage !== id),
            },
            this.updateInternalState,
        );
    };

    selectSimilarStages = () => {
        const selectedStages = [];
        this.state.stagesSharing.forEach(stage => {
            if (areSharingPropertiesSimilar(stage, this.state.programSharing)) {
                selectedStages.push(stage.id);
            }
        });

        this.setState({
            selectedStages,
        });
    };

    selectAllStages = () => {
        this.setState({
            selectedStages: this.state.stagesSharing.map(stage => stage.id),
        });
    };

    deselectAllStages = () => {
        this.setState({
            selectedStages: [],
        });
    };

    openSharingDialog = (model, sharingType) => {
        const objectToShare = {
            meta: {
                allowPublicAccess: true,
                allowExternalAccess: false,
            },
            object: {
                user: model.user,
                displayName: model.displayName || model.name,
                userAccesses: model.userAccesses,
                userGroupAccesses: model.userGroupAccesses,
                publicAccess: model.publicAccess,
                externalAccess: false,
            }
        };

        this.setState({
            sharingDialogOpen: true,
            sharingType,
            sharingId: model.id,
            objectToShare,
        });
    };

    closeSharingDialog = () => {
        this.setState({
            sharingDialogOpen: false,
        });
    };

    confirmAndCloseSharingDialog = updatedSharing => {
        if (!updatedSharing.userAccesses) updatedSharing.userAccesses = [];
        if (!updatedSharing.userGroupAccesses) updatedSharing.userGroupAccesses = [];

        if (updatedSharing.id === this.state.programSharing.id) {
            this.updateProgramAccess(updatedSharing)
        } else {
            this.updateStageAccess(updatedSharing)
        }

        this.closeSharingDialog();
    }

    updateProgramAccess = updatedSharing => {
        this.storeProgramChanges(updatedSharing);
            this.setState({
                programSharing: updatedSharing,
            }, this.updateInternalState);
    }

    updateStageAccess = updatedSharing => {
        this.storeStageChanges(updatedSharing.id, updatedSharing);
        this.setState({
            stagesSharing: this.state.stagesSharing.map(stage =>
                updatedSharing.id === stage.id
                    ? updatedSharing
                    : stage
            ),
        }, this.updateInternalState);
    }

    storeProgramChanges = (program) => {
        sharingFields.forEach(property => {
            this.props.editFieldChanged(
                property,
                program[property],
            )
        })
    }

    storeStageChanges = (stageId, sharingProperties) => {
        sharingFields.forEach(property => {
            this.props.editProgramStageField(
                stageId,
                property,
                sharingProperties[property],
            );
        });
    }

    propagateAccess = event => {
        event.stopPropagation();

        this.state.stagesSharing.forEach(stage => {
            if (this.state.selectedStages.includes(stage.id)) {
                this.storeStageChanges(stage.id, this.state.programSharing);
            }
        });

        const propagateIfSelected = stage => {
            if (this.state.selectedStages.includes(stage.id)) {
                return {
                    ...this.state.programSharing,
                    id: stage.id,
                    displayName: stage.displayName || stage.name,
                };
            } else return stage;
        };

        this.setState(
            {
                stagesSharing: this.state.stagesSharing.map(propagateIfSelected),
            },
            this.updateInternalState,
        );
    };

    updateInternalState = () => {
        const stagesWithSimilarAccessAsProgram = this.state.stagesSharing
            .filter(stage => areSharingPropertiesSimilar(this.state.programSharing, stage))
            .map(stage => stage.id);

        this.setState({
            stagesWithSimilarAccessAsProgram,
        });
    };

    render = () => {
        const stageSharingList = this.state.stagesSharing.map(stage => {
            const leftAvatar =
                this.state.stagesWithSimilarAccessAsProgram.includes(stage.id)
                    ? (<div />)
                    : (
                        <IconButton
                            style={{ pointer: 'default' }}
                            tooltip={this.translate("differs_from_program")}
                        >
                            <WarningIcon
                                style={styles.warningIcon}
                                color={yellow800}
                            />
                        </IconButton>
                    )

            return (
                <ListItem
                    style={styles.stageSharingItem}
                    onClick={() => this.openSharingDialog(stage, 'programStage')}
                    leftAvatar={leftAvatar}
                    key={stage.id}
                    primaryText={stage.displayName || stage.name}
                    secondaryText={generateSharingDescription(stage)}
                />
            );
        });

        const checkBoxList = this.state.stagesSharing.map(stage => (
            <Checkbox
                key={stage.id}
                style={{
                    height: '80px',
                    paddingTop: '24px',
                    paddingLeft: '32px',
                }}
                onCheck={this.toggleStageSelection(stage.id)}
                checked={this.state.selectedStages.includes(stage.id)}
            />
        ));

        return (
            <div style={styles.container}>
                <ListItem
                    onClick={() =>
                        this.openSharingDialog(this.props.model, 'program')
                    }
                    primaryText={this.props.model.displayName || this.props.model.name}
                    secondaryText={generateSharingDescription(this.state.programSharing)}
                    rightIconButton={
                        <FlatButton
                            primary
                            disabled={this.state.selectedStages.length === 0}
                            style={{ height: 45 }}
                            icon={<ArrowDownwardIcon />}
                            label={this.translate("apply_to_selected_stages")}
                            labelPosition="before"
                            onClick={this.propagateAccess}
                        />
                    }
                />
                <Divider />
                <Toolbar
                    selectAll={this.selectAllStages}
                    deselectAll={this.deselectAllStages}
                    selectSimilar={this.selectSimilarStages}
                    areNoneSelected={this.state.selectedStages.length === 0}
                    areAllSelected={
                        this.state.selectedStages.length === this.state.stagesSharing.length
                    }
                />
                {this.state.stagesSharing.length !== 0 && (
                    <div style={styles.programStageList}>
                        <div style={{ flex: 1 }}>{stageSharingList}</div>
                        <div>{checkBoxList}</div>
                    </div>
                )}
                <SharingDialog
                    doNotPost
                    sharedObject={this.state.objectToShare}
                    open={this.state.sharingDialogOpen}
                    id={this.state.sharingId}
                    type={this.state.sharingType}
                    onRequestClose={this.closeSharingDialog}
                    onConfirm={this.confirmAndCloseSharingDialog}
                    d2={this.context.d2}
                />
            </div>
        );
    };
}

ProgramStagesAccess.contextTypes = {
    d2: PropTypes.object,
};

const mapStateToProps = () => ({});
const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            editFieldChanged,
            editProgramStageField,
        },
        dispatch,
    );

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ProgramStagesAccess);
