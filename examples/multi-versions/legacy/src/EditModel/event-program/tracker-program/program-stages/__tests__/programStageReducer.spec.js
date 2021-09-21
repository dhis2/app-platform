import reducer from '../reducer';
import * as programActions from '../actions';
import * as iterator from '../../../../stepper/stepIterator';
import steps from '../programStageSteps';
import { STEPPER_RESET_ACTIVE_STEP } from '../../../../stepper/stepper.actions';

describe('ProgramStage Reducer', () => {
    let intialState;

    beforeAll(() => {
        iterator.next = jest.fn();
        iterator.previous = jest.fn();
        iterator.first = jest.fn();

        intialState = {
            mode: 'none',
            activeStep: iterator.first(steps),
            stageId: null,
        };
    });

    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterAll(() => {
        jest.clearAllMocks();
    });

    test('it should return the default state', () => {
        expect(reducer(undefined, {})).toEqual(intialState);
    });

    describe('when receiving actions', () => {
        test('it should handle PROGRAM_STAGE_STEP_CHANGE', () => {
            const step = 'Padni';
            const expectedState = {
                ...intialState,
                activeStep: step,
            };

            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_STEP_CHANGE,
                    payload: {
                        stepKey: step,
                    },
                }),
            ).toEqual(expectedState);
        });

        test('it should handle PROGRAM_STAGE_STEP_NEXT', () => {
            const step = 'Padni';
            iterator.next.mockReturnValue(step);

            const expectedState = {
                ...intialState,
                activeStep: step,
            };
            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_STEP_NEXT,
                }),
            ).toEqual(expectedState);
            expect(iterator.next).toHaveBeenCalledTimes(1);
            expect(iterator.previous).toHaveBeenCalledTimes(0);
        });

        test('it should handle PROGRAM_STAGE_STEP_PREVIOUS', () => {
            const step = 'Stranger steps';
            iterator.previous.mockReturnValue(step);

            const expectedState = {
                ...intialState,
                activeStep: step,
            };
            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_STEP_PREVIOUS,
                }),
            ).toEqual(expectedState);
            expect(iterator.next).toHaveBeenCalledTimes(0);
            expect(iterator.previous).toHaveBeenCalledTimes(1);
        });

        test('it should handle STEPPER_RESET_ACTIVE_STEP', () => {
            const step = 'Uno';
            iterator.first.mockReturnValue(step);

            const expectedState = {
                ...intialState,
                activeStep: step,
            };
            expect(
                reducer(intialState, {
                    type: STEPPER_RESET_ACTIVE_STEP,
                }),
            ).toEqual(expectedState);
            expect(iterator.first).toHaveBeenCalledTimes(1);
        });

        test('it should handle PROGRAM_STAGE_EDIT', () => {
            const stageId = 'Dos';

            const expectedState = {
                ...intialState,
                mode: 'edit',
                stageId,
            };
            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_EDIT,
                    payload: {
                        stageId,
                        addNewStage: false,
                    },
                }),
            ).toEqual(expectedState);
        });

        test('it should handle PROGRAM_STAGE_EDIT with adding a new one', () => {
            const stageId = 'Dos';

            const expectedState = {
                ...intialState,
                mode: 'add',
                stageId,
            };
            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_EDIT,
                    payload: {
                        stageId,
                        addNewStage: true,
                    },
                }),
            ).toEqual(expectedState);
        });

        test('it should handle PROGRAM_STAGE_EDIT_RESET', () => {
            const expectedState = {
                ...intialState,
            };

            expect(
                reducer(intialState, {
                    type: programActions.PROGRAM_STAGE_EDIT_RESET,
                }),
            ).toEqual(expectedState);
        });
    });
});
