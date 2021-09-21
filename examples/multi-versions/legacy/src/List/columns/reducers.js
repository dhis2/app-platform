import {
    setColumnsTypes,
    configurableColumnsLoadTypes,
} from './actions';
import { combineReducers } from 'redux';

function createReducer(initialState, handlers) {
    return function reducer(state = initialState, action) {
        if (handlers.hasOwnProperty(action.type)) {
            return handlers[action.type](state, action);
        } else {
            return state;
        }
    };
}

export const setColumnsForModel = (state, action) => {
    const { modelType, columns } = action.payload;
    const model = state[modelType];
    return {
        ...state,
        [modelType]: {
            ...model,
            columns: Array.isArray(columns) ? columns : [],
        },
    };
};

const setColumns = (state, action) => {
    return {
        ...action.payload.modelTypes,
    };
};

const byModelTypeReducer = createReducer(
    {},
    {
        [setColumnsTypes.success]: setColumnsForModel,
        [configurableColumnsLoadTypes.success]: setColumns,
    }
);

export const configurableColumnsReducer = combineReducers({
    modelTypes: byModelTypeReducer,
});

export default configurableColumnsReducer;
