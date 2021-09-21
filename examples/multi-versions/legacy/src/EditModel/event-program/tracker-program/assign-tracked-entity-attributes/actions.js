export const PROGRAM_ATTRIBUTES_ADD = 'PROGRAM_ATTRIBUTES_ADD';
export const PROGRAM_ATTRIBUTES_REMOVE = 'PROGRAM_ATTRIBUTES_REMOVE';
export const PROGRAM_ATTRIBUTES_ADDREMOVE_COMPLETE = 'PROGRAM_ATTRIBUTES_ADDREMOVE_COMPLETE';
export const PROGRAM_ATTRIBUTES_EDIT = 'PROGRAM_ATTRIBUTES_EDIT';
export const PROGRAM_ATTRIBUTES_EDIT_COMPLETE = 'PROGRAM_ATTRIBUTES_EDIT_COMPLETE';
export const PROGRAM_ATTRIBUTES_SET_ORDER = "PROGRAM_ATTRIBUTES_SET_ORDER";

const actionCreator = type => payload => ({ type, payload });

export const addAttributesToProgram = actionCreator(PROGRAM_ATTRIBUTES_ADD);
export const removeAttributesFromProgram = actionCreator(PROGRAM_ATTRIBUTES_REMOVE);

export const editProgramAttributes = actionCreator(PROGRAM_ATTRIBUTES_EDIT);

export const setAttributesOrder = newOrderIds => actionCreator(PROGRAM_ATTRIBUTES_SET_ORDER)({newOrderIds});