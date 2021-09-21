import * as actions from '../actions';

describe('Model to edit actions', () => {
    describe('for notifying users', () => {
        test('should defined the notification constants', () => {
            expect(actions.NOTIFY_USER).toBe('NOTIFY_USER');
        });

        test('should create a notify user action when calling notifyUser', () => {
            const expectedAction = {
                type: actions.NOTIFY_USER,
                payload: undefined,
            };

            expect(actions.notifyUser()).toEqual(expectedAction);
        });
    });
});
