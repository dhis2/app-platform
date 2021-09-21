import reducer, { initialState as stepperInitialState } from '../reducers';
import * as actions from '../actions';
import { STEPPER_RESET_ACTIVE_STEP } from '../../stepper/stepper.actions';
import * as iterator from '../../stepper/stepIterator';
import { initialState as notificationsInitialState } from '../notifications/reducers';

describe('Event Program', () => {
    beforeAll(() => {
        iterator.next = jest.fn();
        iterator.previous = jest.fn();
        iterator.first = jest.fn();
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    describe('combined reducer', () => {
        test('should return the event program state', () => {
            const stepKey = 'shuffle';
            iterator.first.mockReturnValue(stepKey);

            const actualState = reducer(undefined, {});

            const expectedState = {
                step: stepperInitialState,
                stageNotifications: notificationsInitialState,
                programStageStepper: {
                    activeStep: stepKey,
                    stageId: null,
                    mode: 'none',
                },
            };

            expect(actualState).toEqual(expectedState);
        });
    });

    describe('stepper reducer', () => {
        test('should return the default state', () => {
            const stepKey = 'sprint';
            iterator.first.mockReturnValue(stepKey);

            const expectedStepState = stepperInitialState;

            const actualState = reducer(undefined, {});

            expect(actualState.step).toEqual(expectedStepState);
        });

        describe('when receiving actions', () => {
            const initialState = {
                step: {
                    activeStep: 'slow-walk',
                },
            };

            test('should change the activeStep when receiving an EVENT_PROGRAM_STEP_CHANGE action', () => {
                const expectedStepKey = 'hop';

                const expectedState = {
                    activeStep: expectedStepKey,
                };

                const actualState = reducer(initialState, {
                    type: actions.EVENT_PROGRAM_STEP_CHANGE,
                    payload: expectedStepKey,
                });

                expect(actualState.step).toEqual(expectedState);
            });

            test('should request the next step when receiving an EVENT_PROGRAM_STEP_NEXT action', () => {
                const expectedStepKey = 'march';
                iterator.next.mockReturnValue(expectedStepKey);

                const expectedState = {
                    activeStep: expectedStepKey,
                };

                const actualState = reducer(initialState, { type: actions.EVENT_PROGRAM_STEP_NEXT });

                expect(iterator.next).toHaveBeenCalledTimes(1);
                expect(iterator.previous).toHaveBeenCalledTimes(0);
                expect(actualState.step).toEqual(expectedState);
            });

            test('should request the previous step when receiving an EVENT_PROGRAM_STEP_PREVIOUS action', () => {
                const expectedStepKey = 'jog';
                iterator.previous.mockReturnValue(expectedStepKey);

                const expectedState = {
                    activeStep: expectedStepKey,
                };

                const actualState = reducer(initialState, { type: actions.EVENT_PROGRAM_STEP_PREVIOUS });

                expect(iterator.next).toHaveBeenCalledTimes(0);
                expect(iterator.previous).toHaveBeenCalledTimes(1);
                expect(actualState.step).toEqual(expectedState);
            });

            test('should request the first step when receiving an STEPPER_RESET_ACTIVE_STEP action', () => {
                const expectedStepKey = 'sprint';
                iterator.first.mockReturnValue(expectedStepKey);

                const expectedState = {
                    activeStep: expectedStepKey,
                    isLoading: true,
                };

                const actualState = reducer(initialState, { type: STEPPER_RESET_ACTIVE_STEP });

                expect(iterator.next).toHaveBeenCalledTimes(0);
                expect(iterator.previous).toHaveBeenCalledTimes(0);
                expect(actualState.step).toEqual(expectedState);
            });

            test('should handle PROGRAM_STEPPER_SET_DISABLE action', () => {
                const expectedState = {
                    activeStep: initialState.step.activeStep,
                    disabled: true,
                };
                const actualStateTrue = reducer(initialState, {
                    type: actions.PROGRAM_STEPPER_SET_DISABLE,
                    payload: {
                        disabled: true,
                    },
                });
                expect(actualStateTrue.step).toEqual(expectedState);

                const actualStateFalse = reducer(initialState, {
                    type: actions.PROGRAM_STEPPER_SET_DISABLE,
                    payload: {
                        disabled: false,
                    },
                });
                expect(actualStateFalse.step).toEqual({ ...expectedState, disabled: false });
            });
        });
    });
});
