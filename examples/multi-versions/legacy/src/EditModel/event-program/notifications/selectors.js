import { get, compose, first, curry, __ } from 'lodash/fp';
import { getProgramStageIndexById } from '../tracker-program/program-stages/selectors';

export const getProgramStages = ({ programStages }) => programStages;

export const getStageNotifications = ({
    programStages,
    programStageNotifications,
}) =>
    compose(get(__, programStageNotifications), get('id'), first)(
        programStages
    );

export const getStageNotificationsForProgramStageId = curry((state, id) => {
    const { programStageNotifications } = state;

    return get(id, programStageNotifications);
});

export const getProgramNotifications = ({ program }) =>
    program.notificationTemplates;

export const getProgramStageDataElements = ({
    programStages,
    availableDataElements,
}) => {
    const programStageDataElements = programStages[0].programStageDataElements.map(
        psde => psde.dataElement.id
    );

    return availableDataElements.filter(de =>
        programStageDataElements.includes(de.id)
    );
};

/**
 * Gets the list of dataElements that are referenced in the programStage
 *  identified by the given stageId
 * @param state programState to get availableDataElements and programStages from
 * @returns {array} an array of dataElements
 */

export const getProgramStageDataElementsByStageId = state => id => {
    const { programStages, availableDataElements } = state;
    const index = getProgramStageIndexById(state, id);
    if(index < 0) return null;
    const programStageDataElements = programStages[
        index
    ].programStageDataElements.map(psde => psde.dataElement.id);

    return availableDataElements.filter(de =>
        programStageDataElements.includes(de.id)
    );
};

export const isDeletingSelector = get(
    'eventProgram.stageNotifications.isDeleting'
);
export const objectNameToBeDeletedSelector = get(
    'eventProgram.stageNotifications.objectNameToBeDeleted'
);
export const modelToEditSelector = get(
    'eventProgram.stageNotifications.modelToEdit'
);

export const getSelectedProgramStageId = get(
    'eventProgram.stageNotifications.selectedProgramStage'
);

export const getNotificationType = get(
    'eventProgram.stageNotifications.notificationType'
);

export const isProgramNotification = state => 'PROGRAM_NOTIFICATION' === get(
    'eventProgram.stageNotifications.notificationType'
)(state);