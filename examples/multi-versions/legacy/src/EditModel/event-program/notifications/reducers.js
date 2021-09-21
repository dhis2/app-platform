import {
    NOTIFICATION_SET_EDIT_MODEL,
    NOTIFICATION_SET_VALUE,
    NOTIFICATION_STAGE_SAVE_ERROR,
    NOTIFICATION_STAGE_SET_PROGRAM_STAGE,
} from './actions';

export const initialState = {
    isDeleting: false,
    modelToEdit: null,
    notificationType: null
}

export function stageNotificationsReducer(
    state = initialState,
    action
) {
    switch (action.type) {
        case NOTIFICATION_SET_VALUE: {
            const model = state.modelToEdit;
            model[action.payload.property] = action.payload.value;

            return {
                ...state,
                modelToEdit: model,
            };
        }
        case NOTIFICATION_SET_EDIT_MODEL: {

            return {
                notificationType: action.payload.notificationType,
                modelToEdit: action.payload.model,
            };
        }
        case NOTIFICATION_STAGE_SET_PROGRAM_STAGE: {
            // Mutating `state.modelToEdit` directly and returning that in the new state object
            // does not work reliably. The old programStage will persist in the state. 
            // Creating a fresh model instance, updating that, and then returning that as modelToEdit
            // does update the state correctly.
            const modelJSON = state.modelToEdit.toJSON();
            const newModelInstance = state.modelToEdit.modelDefinition.create(modelJSON);

            newModelInstance.programStage = {
                displayName: action.payload.stage.displayName,
                id: action.payload.stage.id,
            };

            return {
                ...state,
                modelToEdit: newModelInstance
            };
        }
        case NOTIFICATION_STAGE_SAVE_ERROR:
            // TODO: Notify user of the error
            console.error(action.payload);
            return;

        case NOTIFICATION_STAGE_SET_PROGRAM_STAGE: {
            const model = state.modelToEdit;
            model.programStage.id = action.payload.stageId;
            return {
                ...state,
                modelToEdit: model,
            }
        }

        default:
            return state;
    }
}
