import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';
import TranslationDialog from 'd2-ui/lib/i18n/TranslationDialog.component';

import FloatingActionButton from 'material-ui/FloatingActionButton/FloatingActionButton';
import FontIcon from 'material-ui/FontIcon/FontIcon';

import DetailsBoxWithScroll from '../../../../List/DetailsBoxWithScroll.component';

import { getTableColumnsForType } from '../../../../config/maintenance-models';
import { getTranslatablePropertiesForModelType } from '../../../../List/List.component';
import { translationSaved, translationError } from './contextActions';
import {
    editProgramStage,
    addProgramStage,
    confirmDeleteProgramStage
} from './actions';
import withAuth from '../../../../utils/Auth'

const styles = {
    fab: {
        textAlign: 'right',
        marginTop: '1rem',
        bottom: '1.5rem',
        right: '1.5rem',
        position: 'fixed',
        zIndex: 10,
    },
    detailsBox: {
        flex: 1,
        marginLeft: '1rem',
        marginRight: '1rem',
        opacity: 1,
        flexGrow: 0,
        paddingLeft: '1rem',
    },
    detailsBoxWrap: {
        paddingLeft: '1rem',
    },
    listWrap: {
        flex: 1,
        display: 'flex',
        flexOrientation: 'row',
    },
    sharingDialogBody: {
        minHeight: '400px',
    },
};

class ProgramStageList extends Component {
    state = {
        stages: this.props.programStages,
        modelType: 'programStage',
        detailsObject: null,
        sharing: {
            id: null,
        },
        translate: {
            model: null,
        },
        tableColumns: getTableColumnsForType('programStage'),
    };

    componentWillReceiveProps(nextProps) {
        if (this.state.stages !== nextProps.programStages && this.props.programStages !== nextProps.programStages) {
            this.setState({
                ...this.state,
                stages: nextProps.programStages,
            });
        }
    }

    openSharing = (model) => {
        this.setState({
            ...this.state,
            sharing: {
                ...this.state.sharing,
                id: model.id,
            },
        });
    };

    closeSharing = () => {
        this.setState({
            ...this.state,
            sharing: {
                ...this.state.sharing,
                id: null,
            },
        });
    };

    openDetails = model => this.setState({ detailsObject: model });

    closeDetails = () => this.setState({ detailsObject: null });

    openTranslate = (model) => {
        this.setState({
            ...this.state,
            translate: {
                ...this.state.translate,
                model,
            },
        });
    };

    handleOnRequestClose = () => {
        this.setState({
            ...this.state,
            translate: { ...this.state.translate, model: null },
        });
    }

    swapStages = (stageA, stageB) => {
        this.setState((state) => {
            const swapOrder = stageA.sortOrder;
            stageA.sortOrder = stageB.sortOrder;
            stageB.sortOrder = swapOrder;
            return {
                sections: state.stages.sort((a, b) => a.sortOrder - b.sortOrder),
            };
        });
    }

    contextActionChecker = (model, action) => {
        if (action === 'move_up') {
            return this.state.stages.indexOf(model) > 0;
        } else if (action === 'move_down') {
            return this.state.stages.indexOf(model) < this.state.stages.length - 1;
        }
        return true;
    };

    moveStageUp = (stage) => {
        const currentIndex = this.state.stages.indexOf(stage);
        if (currentIndex > 0) {
            const swapStage = this.state.stages[currentIndex - 1];
            this.swapStages(swapStage, stage);
        }
    }

    moveStageDown = (stage) => {
        const currentIndex = this.state.stages.indexOf(stage);
        if (currentIndex < this.state.stages.length - 1) {
            const swapStage = this.state.stages[currentIndex + 1];
            this.swapStages(swapStage, stage);
        }
    }

    renderSharing = () => (!!this.state.sharing.id &&
        <SharingDialog
            id={this.state.sharing.id}
            type={this.state.modelType}
            open={!!this.state.sharing.id}
            onRequestClose={this.closeSharing}
            bodyStyle={styles.sharingDialogBody}
            d2={this.context.d2}
        />
    );

    renderTranslate = () => (!!this.state.translate.model &&
        <TranslationDialog
            objectToTranslate={this.state.translate.model}
            objectTypeToTranslate={
                this.state.translate.model.modelDefinition
            }
            open={!!this.state.translate.model}
            onTranslationSaved={translationSaved}
            onTranslationError={translationError}
            onRequestClose={this.handleOnRequestClose}
            fieldsToTranslate={getTranslatablePropertiesForModelType(
                this.state.modelType,
            )}
        />
    );

    renderDetails = () => (!!this.state.detailsObject &&
        <div style={styles.detailsBoxWrap}>
            <DetailsBoxWithScroll
                detailsObject={this.state.detailsObject}
                onClose={this.closeDetails}
                styles={styles.detailsBox}
            />
        </div>
    );

    renderFAB = () => {
        if (
            !this.props
                .getCurrentUser()
                .canCreate(this.props.getModelDefinitionByName('programStage'))
        ) {
            return null;
        }

        return (
            <div style={styles.fab}>
                <FloatingActionButton
                    onClick={this.props.handleNewProgramStage}
                >
                    <FontIcon className="material-icons">add</FontIcon>
                </FloatingActionButton>
            </div>
        );
    };

    render() {
        const contextActions = {
            edit: this.props.handleEditProgramStage,
            share: this.openSharing,
            delete: this.props.handleDeleteProgramStage,
            details: this.openDetails,
            translate: this.openTranslate,
            move_up: this.moveStageUp,
            move_down: this.moveStageDown,
        };

        const contextMenuIcons = {
            edit: 'edit',
            share: 'share',
            move_up: 'arrow_upward',
            move_down: 'arrow_downward',
        };
        return (
            <div style={styles.listWrap}>
                <DataTable
                    rows={this.state.stages}
                    columns={this.props.tableColumns}
                    primaryAction={this.props.handleEditProgramStage}
                    contextMenuActions={contextActions}
                    contextMenuIcons={contextMenuIcons}
                    isContextActionAllowed={this.contextActionChecker}
                />
                {this.renderDetails()}
                {this.renderSharing()}
                {this.renderTranslate()}
                {this.renderFAB()}
            </div>
        );
    }
}

ProgramStageList.propTypes = {
    programStages: PropTypes.array.isRequired,
    tableColumns: PropTypes.array,
    handleNewProgramStage: PropTypes.func.isRequired,
    handleEditProgramStage: PropTypes.func.isRequired,
    handleDeleteProgramStage: PropTypes.func.isRequired,
    getCurrentUser: PropTypes.func.isRequired,
    getModelDefinitionByName: PropTypes.func.isRequired,
};

ProgramStageList.defaultProps = {
    tableColumns: ['name', 'lastUpdated'],
};

ProgramStageList.contextTypes = {
    d2: PropTypes.object.isRequired,
};

export default connect(null, dispatch =>
    bindActionCreators(
        {
            handleEditProgramStage: model => editProgramStage(model.id),
            handleNewProgramStage: () => addProgramStage(),
            handleDeleteProgramStage: model => confirmDeleteProgramStage(model.id),
        },
        dispatch,
    ),
)(withAuth(ProgramStageList));
