import * as actions from '../actions';

describe('Assignment of data elements', () => {
    describe('adding data elements', () => {
        test('should have the constant PROGRAM_STAGE_DATA_ELEMENTS_REMOVE', () => {
            expect(actions.PROGRAM_STAGE_DATA_ELEMENTS_ADD).toBe('PROGRAM_STAGE_DATA_ELEMENTS_ADD');
        });

        test('should have the addDataElementsToStage action creator', () => {
            expect(typeof actions.addDataElementsToStage).toBe('function');
        });

        test('should return the correct action from addDataElementsToStage', () => {
            expect(actions.addDataElementsToStage({
                programStage: 'd9wIqlzSMgE',
                dataElements: ['pTo4uMt3xur', 'qrur9Dvnyt5'],
            })).toEqual({
                type: 'PROGRAM_STAGE_DATA_ELEMENTS_ADD',
                payload: {
                    programStage: 'd9wIqlzSMgE',
                    dataElements: ['pTo4uMt3xur', 'qrur9Dvnyt5'],
                },
            });
        });
    });

    describe('removing data elements', () => {
        test('should have the constant PROGRAM_STAGE_DATA_ELEMENTS_REMOVE', () => {
            expect(actions.PROGRAM_STAGE_DATA_ELEMENTS_REMOVE).toBe('PROGRAM_STAGE_DATA_ELEMENTS_REMOVE');
        });

        test('should have the removeDataElementsFromStage action creator', () => {
            expect(typeof actions.removeDataElementsFromStage).toBe('function');
        });

        test(
            'should return the correct action from removeDataElementsFromStage',
            () => {
                expect(actions.removeDataElementsFromStage(['pTo4uMt3xur', 'qrur9Dvnyt5'])).toEqual({
                    type: 'PROGRAM_STAGE_DATA_ELEMENTS_REMOVE',
                    payload: ['pTo4uMt3xur', 'qrur9Dvnyt5'],
                });
            }
        );
    });

    test(
        'should have the constant PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE',
        () => {
            expect(actions.PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE).toBe('PROGRAM_STAGE_DATA_ELEMENTS_ADDREMOVE_COMPLETE');
        }
    );

    describe('editing of program stage data element', () => {
        test('should have the required constants', () => {
            expect(actions.PROGRAM_STAGE_DATA_ELEMENT_EDIT).toBe('PROGRAM_STAGE_DATA_ELEMENT_EDIT');
            expect(actions.PROGRAM_STAGE_DATA_ELEMENT_EDIT_COMPLETE).toBe('PROGRAM_STAGE_DATA_ELEMENTS_EDIT_COMPLETE');
        });

        test(
            'should have the action creator for PROGRAM_STAGE_DATA_ELEMENT_EDIT',
            () => {
                const programStageDataElement = {
                    lastUpdated: '2017-05-03T13:32:17.730',
                    id: 'd9wIqlzSMgE',
                    created: '2016-04-01T15:07:12.695',
                    displayInReports: true,
                    externalAccess: false,
                    renderOptionsAsRadio: false,
                    allowFutureDate: false,
                    compulsory: true,
                    allowProvidedElsewhere: false,
                    sortOrder: 0,
                    lastUpdatedBy: { id: 'xE7jOejl9FI' },
                    programStage: { id: 'pTo4uMt3xur' },
                    dataElement: { id: 'qrur9Dvnyt5' },
                    translations: [],
                    userGroupAccesses: [],
                    attributeValues: [],
                    userAccesses: [],
                };

                expect(actions.editProgramStageDataElement(programStageDataElement)).toEqual({
                    type: actions.PROGRAM_STAGE_DATA_ELEMENT_EDIT,
                    payload: {
                        lastUpdated: '2017-05-03T13:32:17.730',
                        id: 'd9wIqlzSMgE',
                        created: '2016-04-01T15:07:12.695',
                        displayInReports: true,
                        externalAccess: false,
                        renderOptionsAsRadio: false,
                        allowFutureDate: false,
                        compulsory: true,
                        allowProvidedElsewhere: false,
                        sortOrder: 0,
                        lastUpdatedBy: { id: 'xE7jOejl9FI' },
                        programStage: { id: 'pTo4uMt3xur' },
                        dataElement: { id: 'qrur9Dvnyt5' },
                        translations: [],
                        userGroupAccesses: [],
                        attributeValues: [],
                        userAccesses: [],
                    },
                });
            }
        );
    });
});
