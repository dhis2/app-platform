const createActionCreator = type => payload => ({ type, payload });

export const NOTIFICATION_STAGE_REMOVE = 'NOTIFICATION_STAGE_REMOVE';
export const NOTIFICATION_STAGE_REMOVE_SUCCESS = 'NOTIFICATION_STAGE_REMOVE_SUCCESS';
export const NOTIFICATION_STAGE_REMOVE_ERROR = 'NOTIFICATION_STAGE_REMOVE_ERROR';
export const NOTIFICATION_SET_EDIT_MODEL = 'NOTIFICATION_SET_EDIT_MODEL';
export const NOTIFICATION_SET_VALUE = 'NOTIFICATION_SET_VALUE';
export const NOTIFICATION_STAGE_SAVE = 'NOTIFICATION_STAGE_SAVE';
export const NOTIFICATION_STAGE_SAVE_SUCCESS = 'NOTIFICATION_STAGE_SAVE_SUCCESS';
export const NOTIFICATION_STAGE_SAVE_ERROR = 'NOTIFICATION_STAGE_SAVE_ERROR';
export const NOTIFICATION_SET_ADD_MODEL = 'NOTIFICATION_SET_ADD_MODEL';

export const NOTIFICATION_STAGE_SET_PROGRAM_STAGE = 'NOTIFICATION_STAGE_SET_PROGRAM_STAGE';

export const NOTIFICATION_PROGRAM_SAVE = 'NOTIFICATION_PROGRAM_SAVE';
export const NOTIFICATION_PROGRAM_SAVE_SUCCESS = 'NOTIFICATION_PROGRAM_SAVE_SUCCESS';
export const NOTIFICATION_PROGRAM_SAVE_ERROR = 'NOTIFICATION_PROGRAM_SAVE_ERROR';
export const NOTIFICATION_PROGRAM_REMOVE = 'NOTIFICATION_PROGRAM_REMOVE';
export const NOTIFICATION_PROGRAM_REMOVE_SUCCESS = 'NOTIFICATION_PROGRAM_REMOVE_SUCCESS';
export const NOTIFICATION_PROGRAM_REMOVE_ERROR = 'NOTIFICATION_PROGRAM_REMOVE_ERROR';

export const removeStageNotification = model => ({ type: NOTIFICATION_STAGE_REMOVE, payload: model });
export const removeStageNotificationSuccess = createActionCreator(NOTIFICATION_STAGE_REMOVE_SUCCESS);
export const removeStageNotificationError = createActionCreator(NOTIFICATION_STAGE_REMOVE_ERROR);

export const removeProgramNotification = model => ({ type: NOTIFICATION_PROGRAM_REMOVE, payload: model });
export const removeProgramNotificationSuccess = createActionCreator(NOTIFICATION_PROGRAM_REMOVE_SUCCESS);


/**
 * Action to set the notification model and show the dialog
 * @param model programNotificationTemplate model to edit
 * @param notificationType Whether the notification is a program or programstage notification
 * One of PROGRAM_NOTIFICATION or PROGRAM_STAGE_NOTIFICATION
 * @returns {*} the action creator
 */
export const setEditModel = (model, notificationType = 'PROGRAM_STAGE_NOTIFICATION') => createActionCreator(NOTIFICATION_SET_EDIT_MODEL)({model, notificationType});
export const setAddModel = (notificationType = 'PROGRAM_STAGE_NOTIFICATION') => createActionCreator(NOTIFICATION_SET_ADD_MODEL)({notificationType});

export const setSelectedProgramStage = (stage) => createActionCreator(NOTIFICATION_STAGE_SET_PROGRAM_STAGE)({stage});

export const setStageNotificationValue = (property, value) => ({ type: NOTIFICATION_SET_VALUE, payload: { property, value } });
export const saveStageNotification = model => ({ type: NOTIFICATION_STAGE_SAVE, payload: model });

export const saveStageNotificationSuccess = createActionCreator(NOTIFICATION_STAGE_SAVE_SUCCESS);
export const saveStageNotificationError = createActionCreator(NOTIFICATION_STAGE_SAVE_ERROR);

export const saveProgramNotification = model => createActionCreator(NOTIFICATION_PROGRAM_SAVE)({model});