import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';
import { findDOMNode } from 'react-dom';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import HTML5Backend from 'react-dnd-html5-backend';

import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import Dialog from 'material-ui/Dialog/Dialog';
import LinearProgress from 'material-ui/LinearProgress/LinearProgress';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';
import Heading from 'd2-ui/lib/headings/Heading.component';

import OptionValue from './OptionValue.component';

import modelToEditStore from '../../modelToEditStore';
import { sortDialogStore, optionsForOptionSetStore } from '../stores';
import snackActions from '../../../Snackbar/snack.actions';

export function setSortDialogOpenTo(status) {
    sortDialogStore.setState({
        ...sortDialogStore.getState(),
        open: status,
    });
}

const ItemTypes = {
    OPTION: 'option',
};

function collect(connect, monitor) {
    return {
        connectDragSource: connect.dragSource(),
        isDragging: monitor.isDragging(),
    };
}

const cardSource = {
    beginDrag(props) {
        return {
            id: props.id,
            index: props.index,
        };
    },
};

const cardTarget = {
    hover(props, monitor, component) {
        const dragId = monitor.getItem().id;
        const hoverId = props.id;

        // Don't replace items with themselves
        if (dragId === hoverId) {
            return;
        }

        // Determine rectangle on screen
        const hoverBoundingRect = findDOMNode(component).getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

        // Determine mouse position
        const clientOffset = monitor.getClientOffset();

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Only perform the move when the mouse has crossed half of the items height
        // When dragging downwards, only move when the cursor is below 50%
        // When dragging upwards, only move when the cursor is above 50%

        // Dragging downwards
        if (dragId < hoverId && hoverClientY < hoverMiddleY) {
            return;
        }

        // Dragging upwards
        if (dragId > hoverId && hoverClientY > hoverMiddleY) {
            return;
        }

        // Time to actually perform the action
        props.moveOption(dragId, hoverId);
        return true;
    },
};

const OptionValueWithDrag = DragSource(ItemTypes.OPTION, cardSource, collect)(OptionValue);
const OptionValueWithDragAndDrop = DropTarget(ItemTypes.OPTION, cardTarget, connect => ({
    connectDropTarget: connect.dropTarget(),
}))(OptionValueWithDrag);

const SortableList = DragDropContext(HTML5Backend)(class extends Component {
    render() {
        return (
            <div>
                {this.props.options.map((option, index) => (<OptionValueWithDragAndDrop
                    key={option.id}
                    index={index}
                    moveOption={this.props.moveOption}
                    displayName={option.displayName}
                    code={option.code}
                    id={option.id}
                />))}
            </div>
        );
    }
});

const sortDialogState$ = Observable
    .combineLatest(
        sortDialogStore,
        optionsForOptionSetStore,
    )
    .map(([state, optionState]) => ({
        ...state,
        ...optionState,
    }));

const styles = {
    actionButtonWrap: {
        display: 'flex',
        justifyContent: 'flex-end',
    },

    actionButton: {
        marginLeft: '1rem',
    },
};

class SortDialog extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            isLoading: true,
            options: [],
        };

        this.i18n = context.d2.i18n;
    }

    componentWillReceiveProps(newProps) {
        this.setState({
            options: newProps.options || this.state.options,
        });
    }

    moveOption = (dragId, targetId) => {
        const dragIndex = this.state.options.findIndex(option => option.id === dragId);
        const targetIndex = this.state.options.findIndex(option => option.id === targetId);
        const dragOption = this.state.options[dragIndex];

        const newList = [...this.state.options];

        newList.splice(dragIndex, 1);
        newList.splice(targetIndex, 0, dragOption);

        this.setState({
            options: newList,
        });
    }

    render() {
        return (
            <Dialog
                open={this.props.open}
                onRequestClose={() => setSortDialogOpenTo(false)}
                autoScrollBodyContent
                style={{ height: '90%' }}
                modal
            >
                <Heading>{this.i18n.getTranslation('sorting')}</Heading>
                {this.renderDialogContent()}
                <div style={styles.actionButtonWrap}>
                    {this.isShowSaveButton() ? <RaisedButton
                        style={styles.actionButton}
                        disabled={this.props.isSaving}
                        onClick={this._saveOptionOrder}
                        primary
                        label={this.i18n.getTranslation(this.props.isSaving ? 'saving' : 'save')}
                    /> : undefined}
                    <RaisedButton
                        style={styles.actionButton}
                        disabled={this.props.isSaving}
                        label={this.i18n.getTranslation('close')}
                        onClick={this._closeDialog}
                    />
                </div>
            </Dialog>
        );
    }

    renderDialogContent() {
        if (this.props.isLoading) {
            return (
                <div>
                    {this.props.isLoading ? <LinearProgress /> : undefined}
                </div>
            );
        }

        if (!this.props.onePage) {
            return (
                <div style={{ padding: '1rem 0' }}>{this.i18n.getTranslation('manual_sorting_is_not_available_for_option_sets_with_more_than_50_options')}</div>
            );
        }

        return (
            <SortableList options={this.state.options} moveOption={this.moveOption} />
        );
    }

    isShowSaveButton() {
        return !this.props.isLoading && this.props.onePage;
    }

    _saveOptionOrder = () => {
        const modelToEdit = modelToEditStore.getState();

        modelToEdit.options.clear();
        this.state.options
            .forEach((option) => {
                modelToEdit.options.add(option);
            });

        sortDialogStore.setState({
            ...sortDialogStore.getState(),
            isSaving: true,
        });

        modelToEditStore.setState(modelToEdit);

        optionsForOptionSetStore.setState({
            ...optionsForOptionSetStore.getState(),
            options: modelToEdit.options.toArray(),
        });

        modelToEdit
            .save()
            .then(() => {
                sortDialogStore.setState({
                    ...sortDialogStore.getState(),
                    isSaving: false,
                });

                snackActions.show({
                    message: 'options_sorted_and_saved',
                    translate: true,
                });

                setSortDialogOpenTo(false);
            })
            .catch(() => {
                sortDialogStore.setState({
                    ...sortDialogStore.getState(),
                    isSaving: false,
                });

                snackActions.show({
                    message: 'failed_to_save_order',
                    action: 'ok',
                    translate: true,
                });
            });
    }

    _closeDialog() {
        setSortDialogOpenTo(false);
    }
}

SortDialog.contextTypes = {
    d2: PropTypes.object,
};
SortDialog.defaultProps = {
    open: false,
    options: [],
};

export default withStateFrom(sortDialogState$, SortDialog);
