const actionCreator = type => payload => ({ type, payload });

export const PROGRAM_SECTIONS_ORDER_CHANGE = 'PROGRAM_SECTIONS_ORDER_CHANGE';
export const PROGRAM_SECTIONS_ADD = 'PROGRAM_SECTIONS_ADD';
export const PROGRAM_SECTIONS_REMOVE = 'PROGRAM_SECTIONS_REMOVE';
export const PROGRAM_SECTION_UPDATE = 'PROGRAM_SECTION_UPDATE';
export const PROGRAM_SECTION_ELEMENT_SET = 'PROGRAM_SECTION_ELEMENT_SET';

export const changeProgramSectionOrder = actionCreator(PROGRAM_SECTIONS_ORDER_CHANGE);
export const addProgramSection = actionCreator(PROGRAM_SECTIONS_ADD);
export const removeProgramSection = actionCreator(PROGRAM_SECTIONS_REMOVE);
export const updateProgramSection = actionCreator(PROGRAM_SECTION_UPDATE);
