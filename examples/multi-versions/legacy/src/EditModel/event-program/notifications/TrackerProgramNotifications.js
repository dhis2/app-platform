import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, Tab } from 'material-ui/Tabs';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { get, pick } from 'lodash/fp';
import withState from 'recompose/withState';
import compose from 'recompose/compose';
import withHandlers from 'recompose/withHandlers';
import mapPropsStream from 'recompose/mapPropsStream';
import NotificationList from './NotificationList';
import { getProgramStages, getProgramNotifications } from './selectors';
import NotificationDeleteDialog from './NotificationDeleteDialog';
import { removeStageNotification, removeProgramNotification, setEditModel, setAddModel } from './actions';
import NotificationDialog from './NotificationDialog';
import eventProgramStore from '../eventProgramStore';

import { getProgramStageById } from '../tracker-program/program-stages/selectors';
import TrackerNotificationAddButton from './TrackerNotificationAddButton';
const programStageTabIndex = 0;
const programStages$ = eventProgramStore.map(getProgramStages);
const stageNotifications$ = eventProgramStore.map(
    get('programStageNotifications')
);

const programNotifications$ = eventProgramStore
    .map(getProgramNotifications)
    .map(n => n.toArray());

const availableDataElements = eventProgramStore.map(
    get('availableDataElements')
);

const TrackerProgramNotifications = (
    {
        programStages,
        programStageNotifications,
        programNotifications,
        askForConfirmation,
        onCancel,
        onDelete,
        open,
        setOpen,
        modelToDelete,
        setEditProgramModel,
        setEditProgramStageModel,
        setAddModel,
        availableDataElements,
        model,
        ...props
    },
    { d2 }
) => {
    const stageNotificationsWithStageNames = [];

    //Flatten stageNotifications to be a list of notifications
    //with reference to the programStage
    for (let stageId in programStageNotifications) {
        const notifications = programStageNotifications[stageId];

        const programStage = props.getProgramStageById(stageId);
        const programStageProps = pick(['displayName', 'id'], programStage);

        notifications.forEach(nf => {
            nf.programStage = programStageProps;
            stageNotificationsWithStageNames.push(nf);
        });
    }
    return (
        <div>
            <Tabs initialSelectedIndex={programStageTabIndex}>
                <Tab
                    label={d2.i18n.getTranslation(
                        'program_stage_notifications'
                    )}
                >
                    <NotificationList
                        showProgramStage
                        notifications={stageNotificationsWithStageNames}
                        onRemoveNotification={askForConfirmation}
                        onEditNotification={setEditProgramStageModel}
                        onAddNotification={setAddModel}
                        showAddButton={true}
                        addButton={TrackerNotificationAddButton}
                    />
                </Tab>
                <Tab label={d2.i18n.getTranslation('program_notifications')}>
                    <NotificationList
                        notifications={programNotifications}
                        onRemoveNotification={askForConfirmation}
                        onEditNotification={setEditProgramModel}
                        onAddNotification={setAddModel}
                        showAddButton={false}
                    />
                </Tab>
            </Tabs>
            <NotificationDialog
                availableDataElements={availableDataElements}
                isTracker
                program={model}
                programStages={programStages}
            />
            <NotificationDeleteDialog
                setOpen={setOpen}
                open={open}
                onCancel={onCancel}
                onConfirm={onDelete}
                name={modelToDelete && modelToDelete.name}
            />
        </div>
    );
};

TrackerProgramNotifications.propTypes = {
    programStageNotifications: PropTypes.any.isRequired,
    programNotifications: PropTypes.any.isRequired,
    askForConfirmation: PropTypes.any.isRequired,
    onCancel: PropTypes.any.isRequired,
    onDelete: PropTypes.any.isRequired,
    open: PropTypes.any.isRequired,
    setOpen: PropTypes.any.isRequired,
    modelToDelete: PropTypes.any,
    setEditProgramStageModel: PropTypes.func.isRequired,
    setEditProgramModel: PropTypes.func.isRequired,
    setAddModel: PropTypes.any.isRequired,
};

TrackerProgramNotifications.contextTypes = {
    d2: PropTypes.object,
};

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            removeStageNotification,
            removeProgramNotification,
            setEditProgramStageModel: model =>
                setEditModel(model, 'PROGRAM_STAGE_NOTIFICATION'),
            setEditProgramModel: model =>
                setEditModel(model, 'PROGRAM_NOTIFICATION'),
            setAddModel,
        },
        dispatch
    );

const enhance = compose(
    // TODO: Impure connect when the reducer is fixed to emit a pure model this can be a pure action
    connect(state => ({}), mapDispatchToProps, undefined, { pure: false }),
    withState('open', 'setOpen', false),
    withState('modelToDelete', 'setModelToDelete', null),
    withHandlers({
        onCancel: ({ setOpen }) => () => setOpen(false),
        onDelete: ({
            setOpen,
            removeStageNotification,
            removeProgramNotification,
            modelToDelete,
        }) => () => {
            setOpen(false);
            if(modelToDelete.programStage) {
                removeStageNotification(modelToDelete);
            } else {
                removeProgramNotification(modelToDelete);
            }

        },
        askForConfirmation: ({ setOpen, setModelToDelete }) => model => {
            setModelToDelete(model);
            setOpen(true);
        },
    }),
    mapPropsStream(props$ =>
        props$.combineLatest(
            programStages$,
            stageNotifications$,
            programNotifications$,
            availableDataElements,
            eventProgramStore,
            (
                props,
                programStages,
                programStageNotifications,
                programNotifications,
                availableDataElements,
                store
            ) => {
                return {
                    ...props,
                    programStages,
                    programStageNotifications,
                    programNotifications,
                    availableDataElements,
                    getProgramStageById: getProgramStageById(store),
                };
            }
        )
    )
);

export default enhance(TrackerProgramNotifications);
