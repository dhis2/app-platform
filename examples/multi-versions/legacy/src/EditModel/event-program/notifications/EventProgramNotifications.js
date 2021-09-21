import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import withState from 'recompose/withState';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import mapPropsStream from 'recompose/mapPropsStream';

import NotificationList from './NotificationList';
import {
    getStageNotifications,
    getProgramStageDataElements,
    getProgramStages
} from './selectors';
import NotificationDeleteDialog from './NotificationDeleteDialog';
import { removeStageNotification, setEditModel, setAddModel } from './actions';
import NotificationDialog from './NotificationDialog';
import eventProgramStore from '../eventProgramStore';

const notifications$ = eventProgramStore.map(getStageNotifications);
const programStageDataElements$ = eventProgramStore.map(
    getProgramStageDataElements
);
const programStages$ = eventProgramStore.map(getProgramStages);

function EventProgramNotifications({
    notifications,
    askForConfirmation,
    onCancel,
    onDelete,
    open,
    setOpen,
    modelToDelete,
    setEditModel,
    setAddModel,
    dataElements,
    programStages
}) {
    return (
        <div>
            <NotificationList
                notifications={notifications}
                onRemoveNotification={askForConfirmation}
                onEditNotification={setEditModel}
                onAddNotification={setAddModel}
            />
            <NotificationDialog dataElements={dataElements} programStages={programStages}/>
            <NotificationDeleteDialog
                setOpen={setOpen}
                open={open}
                onCancel={onCancel}
                onConfirm={onDelete}
                name={modelToDelete && modelToDelete.name}
            />
        </div>
    );
}
EventProgramNotifications.propTypes = {
    notifications: PropTypes.any.isRequired,
    askForConfirmation: PropTypes.any.isRequired,
    onCancel: PropTypes.any.isRequired,
    onDelete: PropTypes.any.isRequired,
    open: PropTypes.any.isRequired,
    setOpen: PropTypes.any.isRequired,
    modelToDelete: PropTypes.any,
    setEditModel: PropTypes.any.isRequired,
    setAddModel: PropTypes.any.isRequired,
    dataElements: PropTypes.any.isRequired,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            removeStageNotification,
            setEditModel: model =>
                setEditModel(model, 'PROGRAM_STAGE_NOTIFICATION'),
            setAddModel,
        },
        dispatch
    );

const enhance = compose(
    // TODO: Impure connect when the reducer is fixed to emit a pure model this can be a pure action
    connect(undefined, mapDispatchToProps, undefined, { pure: false }),
    withState('open', 'setOpen', false),
    withState('modelToDelete', 'setModelToDelete', null),
    withHandlers({
        onCancel: ({ setOpen }) => () => setOpen(false),
        onDelete: ({
            setOpen,
            removeStageNotification,
            modelToDelete,
        }) => () => {
            setOpen(false);
            removeStageNotification(modelToDelete);
        },
        askForConfirmation: ({ setOpen, setModelToDelete }) => model => {
            setModelToDelete(model);
            setOpen(true);
        },
    }),
    mapPropsStream(props$ =>
        props$.combineLatest(
            programStages$,
            notifications$,
            programStageDataElements$,
            (props, programStages, notifications, dataElements) => ({
                ...props,
                programStages,
                notifications,
                dataElements,
            })
        )
    )
);

export default enhance(EventProgramNotifications);
