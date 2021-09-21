import * as actions from '../actions';
import { NOTIFY_USER, notifyUser } from '../../actions';

describe('Event Program actions', () => {
    describe('for stepper', () => {
        test('should have defined the stepper constants', () => {
            expect(actions.EVENT_PROGRAM_STEP_PREVIOUS).toBe('EVENT_PROGRAM_STEP_PREVIOUS');
            expect(actions.EVENT_PROGRAM_STEP_NEXT).toBe('EVENT_PROGRAM_STEP_NEXT');
            expect(actions.EVENT_PROGRAM_STEP_CHANGE).toBe('EVENT_PROGRAM_STEP_CHANGE');
        });

        test('should create the EVENT_PROGRAM_STEP_CHANGE action', () => {
            expect(actions.changeStep()).toEqual({ type: actions.EVENT_PROGRAM_STEP_CHANGE, payload: undefined });
        });

        test('should use the parameter as the payload', () => {
            expect(actions.changeStep('details')).toEqual({ type: actions.EVENT_PROGRAM_STEP_CHANGE, payload: 'details' });
        });

        test('should create the EVENT_PROGRAM_STEP_NEXT action', () => {
            expect(actions.nextStep()).toEqual({ type: actions.EVENT_PROGRAM_STEP_NEXT });
        });

        test('should create the EVENT_PROGRAM_STEP_PREVIOUS action', () => {
            expect(actions.previousStep()).toEqual({ type: actions.EVENT_PROGRAM_STEP_PREVIOUS });
        });
    });

    describe('for loading a event program', () => {
        test('should have the event program load constants', () => {
            expect(actions.EVENT_PROGRAM_LOAD).toBe('EVENT_PROGRAM_LOAD');
            expect(actions.EVENT_PROGRAM_LOAD_SUCCESS).toBe('EVENT_PROGRAM_LOAD_SUCCESS');
            expect(actions.EVENT_PROGRAM_LOAD_ERROR).toBe('EVENT_PROGRAM_LOAD_ERROR');
        });

        test('should create the EVENT_PROGRAM_LOAD action', () => {
            expect(actions.loadEventProgram()).toEqual({ type: actions.EVENT_PROGRAM_LOAD, payload: undefined });
        });

        test('should create the EVENT_PROGRAM_LOAD_SUCCESS action', () => {
            expect(actions.loadEventProgramSuccess()).toEqual({ type: actions.EVENT_PROGRAM_LOAD_SUCCESS, payload: undefined });
        });

        test('should create the EVENT_PROGRAM_LOAD_SUCCESS action', () => {
            expect(actions.loadEventProgramFailure()).toEqual({ type: actions.EVENT_PROGRAM_LOAD_ERROR, payload: undefined });
        });
    });

    describe('for editing models', () => {
        test('should have defined the model constants', () => {
            expect(actions.MODEL_TO_EDIT_LOADED).toBe('MODEL_TO_EDIT_LOADED');
            expect(actions.MODEL_TO_EDIT_FIELD_CHANGED).toBe('MODEL_TO_EDIT_FIELD_CHANGED');
        });

        test('should create the action when calling editFieldChanged', () => {
            const expectedAction = {
                type: 'MODEL_TO_EDIT_FIELD_CHANGED',
                payload: {
                    field: 'name',
                    value: 'John',
                },
            };

            expect(actions.editFieldChanged('name', 'John')).toEqual(expectedAction);
        });
    });

    describe('for saving an event program', () => {
        test('should have defined the constants', () => {
            expect(actions.EVENT_PROGRAM_SAVE).toBe('EVENT_PROGRAM_SAVE');
            expect(actions.EVENT_PROGRAM_SAVE_SUCCESS).toBe('EVENT_PROGRAM_SAVE_SUCCESS');
            expect(actions.EVENT_PROGRAM_SAVE_ERROR).toBe('EVENT_PROGRAM_SAVE_ERROR');
        });

        test('should create the save action when calling saveEventProgram', () => {
            const expectedAction = {
                type: actions.EVENT_PROGRAM_SAVE,
                payload: undefined,
            };

            expect(actions.saveEventProgram()).toEqual(expectedAction);
        });

        test(
            'should create the save success action when calling saveEventProgramSuccess',
            () => {
                const expectedAction = {
                    type: actions.EVENT_PROGRAM_SAVE_SUCCESS,
                    payload: undefined,
                };

                expect(actions.saveEventProgramSuccess()).toEqual(expectedAction);
            }
        );

        test(
            'should create the save error action when calling saveEventProgramError',
            () => {
                const expectedAction = {
                    type: actions.EVENT_PROGRAM_SAVE_ERROR,
                    payload: new Error('Could not load'),
                };

                expect(actions.saveEventProgramError(new Error('Could not load'))).toEqual(expectedAction);
            }
        );
    });

    describe('for notifying users', () => {
        test('should defined the notification constants', () => {
            expect(NOTIFY_USER).toBe('NOTIFY_USER');
        });

        test('should create a notify user action when calling notifyUser', () => {
            const expectedAction = {
                type: NOTIFY_USER,
                payload: undefined,
            };

            expect(notifyUser()).toEqual(expectedAction);
        });
    });
});
