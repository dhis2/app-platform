import { DIALOG_OPEN, DIALOG_CLOSE } from './actions';

const emptyDialog = { dialogType: null, dialogProps: {} };
const initialState = {
    ...emptyDialog,
};

const dialog = (state = initialState, action) => {
    switch (action.type) {
        case DIALOG_OPEN: {
            return {
                ...state,
                dialogType: action.payload.dialogType,
                dialogProps: action.payload.dialogProps,
            };
        }

        case DIALOG_CLOSE: {
            return {
                ...state,
                ...emptyDialog,
            };
        }

        default: {
            return state;
        }
    }
};

export default dialog;
