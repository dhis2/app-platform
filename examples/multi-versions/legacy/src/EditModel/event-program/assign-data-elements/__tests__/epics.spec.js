import { ActionsObservable } from 'redux-observable';
import Store from 'd2-ui/lib/store/Store';
import { isValidUid } from 'd2/lib/uid';
import {
    PROGRAM_STAGE_DATA_ELEMENTS_ADD,
    PROGRAM_STAGE_DATA_ELEMENTS_REMOVE,
    PROGRAM_STAGE_DATA_ELEMENT_EDIT,
} from '../actions';
import createEpicsForStore from '../epics';

const availableDataElementA = { id: "eMyVanycQSC", displayName: "First available element", valueType: "INTEGER" };
const availableDataElementB = { id: "d68jOejl9FI", displayName: "Second available element", valueType: "FILE_RESOURCE" };

describe('Assign data elements epics', () => {
    const createActionStreamFor = action => ActionsObservable.of(action);

    let store;
    let epic;

    beforeEach(() => {
        store = Store.create();
        epic = createEpicsForStore(store);

        store.setState({
            programStages: [
                {
                    id: 'pTo4uMt3xur',
                    programStageDataElements: [{
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
                    }, {
                        lastUpdated: '2017-05-03T13:32:17.729',
                        id: 'FKHaErzkvEF',
                        created: '2016-04-01T15:07:12.723',
                        displayInReports: true,
                        externalAccess: false,
                        renderOptionsAsRadio: true,
                        allowFutureDate: false,
                        compulsory: true,
                        allowProvidedElsewhere: false,
                        sortOrder: 1,
                        lastUpdatedBy: { id: 'xE7jOejl9FI' },
                        programStage: { id: 'pTo4uMt3xur' },
                        dataElement: { id: 'oZg33kd9taw' },
                        translations: [],
                        userGroupAccesses: [],
                        attributeValues: [],
                        userAccesses: [],
                    }],
                },
            ],
            availableDataElements: [
                { ...availableDataElementA },
                { ...availableDataElementB },
            ]
        });
    });

    describe('adding new data elements to the program stage', () => {
        test('should add a single programStageDataElement', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_ADD,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['eMyVanycQSC'],
                },
            };

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(store.getState().programStages[0].programStageDataElements).toHaveLength(3);
                        const newlyAddedDataElement = store.getState().programStages[0].programStageDataElements[2];

                        expect(isValidUid(newlyAddedDataElement.id)).toBe(true);
                        expect(newlyAddedDataElement.dataElement).toEqual({
                            id: availableDataElementA.id,
                            displayName: availableDataElementA.displayName,
                            optionSet: availableDataElementA.optionSet,
                            valueType: availableDataElementA.valueType,
                        });
                        done();
                    },
                    done);
        });

        test('should add multiple programStageDataElement', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_ADD,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['eMyVanycQSC', 'd68jOejl9FI'],
                },
            };

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(store.getState().programStages[0].programStageDataElements).toHaveLength(4);
                        const newlyAddedDataElementOne = store.getState().programStages[0].programStageDataElements[2];
                        const newlyAddedDataElementTwo = store.getState().programStages[0].programStageDataElements[3];

                        expect(isValidUid(newlyAddedDataElementOne.id)).toBe(true);
                        expect(isValidUid(newlyAddedDataElementTwo.id)).toBe(true);

                        expect(newlyAddedDataElementOne.dataElement).toEqual({
                            id: availableDataElementA.id,
                            displayName: availableDataElementA.displayName,
                            optionSet: availableDataElementA.optionSet,
                            valueType: availableDataElementA.valueType,
                        });
                        expect(newlyAddedDataElementTwo.dataElement).toEqual({
                            id: availableDataElementB.id,
                            displayName: availableDataElementB.displayName,
                            optionSet: availableDataElementB.optionSet,
                            valueType: availableDataElementB.valueType,
                        });
                        done();
                    },
                    done
                );
        });

        test('should emit the state from the store', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_ADD,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['eMyVanycQSC'],
                },
            };

            const storeSubscriptionSpy = jest.fn();
            store.subscribe(storeSubscriptionSpy);

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(storeSubscriptionSpy).toHaveBeenCalledTimes(2);
                        done();
                    },
                    done
                );
        });
    });

    describe('removing data elements from the program stage', () => {
        test('should remove the provided data element', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_REMOVE,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['qrur9Dvnyt5'],
                },
            };

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(store.getState().programStages[0].programStageDataElements).toHaveLength(1);
                        const remainingDataElement = store.getState().programStages[0].programStageDataElements[0];

                        expect(isValidUid(remainingDataElement.id)).toBe(true);
                        expect(remainingDataElement).toEqual({
                            lastUpdated: '2017-05-03T13:32:17.729',
                            id: 'FKHaErzkvEF',
                            created: '2016-04-01T15:07:12.723',
                            displayInReports: true,
                            externalAccess: false,
                            renderOptionsAsRadio: true,
                            allowFutureDate: false,
                            compulsory: true,
                            allowProvidedElsewhere: false,
                            sortOrder: 1,
                            lastUpdatedBy: { id: 'xE7jOejl9FI' },
                            programStage: { id: 'pTo4uMt3xur' },
                            dataElement: { id: 'oZg33kd9taw' },
                            translations: [],
                            userGroupAccesses: [],
                            attributeValues: [],
                            userAccesses: [],
                        });
                        done();
                    },
                    done
                );
        });

        test('should remove all the provided dataElements', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_REMOVE,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['qrur9Dvnyt5', 'oZg33kd9taw'],
                },
            };

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(store.getState().programStages[0].programStageDataElements).toHaveLength(0);
                        done();
                    },
                    done
                );
        });

        test('should emit the state from the store', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENTS_REMOVE,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    dataElements: ['eMyVanycQSC'],
                },
            };

            const storeSubscriptionSpy = jest.fn();
            store.subscribe(storeSubscriptionSpy);

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(storeSubscriptionSpy).toHaveBeenCalledTimes(2);
                        done();
                    },
                    done
                );
        });
    });

    describe('editing programStageDataElement', () => {
        test(
            'should update the programStageDataElement with the new values',
            (done) => {
                const action = {
                    type: PROGRAM_STAGE_DATA_ELEMENT_EDIT,
                    payload: {
                        programStage: 'pTo4uMt3xur',
                        programStageDataElement: {
                            lastUpdated: '2017-05-03T13:32:17.730',
                            id: 'd9wIqlzSMgE',
                            created: '2016-04-01T15:07:12.695',
                            displayInReports: false,
                            externalAccess: false,
                            renderOptionsAsRadio: false,
                            allowFutureDate: false,
                            compulsory: false,
                            allowProvidedElsewhere: true,
                            sortOrder: 0,
                            lastUpdatedBy: { id: 'xE7jOejl9FI' },
                            programStage: { id: 'pTo4uMt3xur' },
                            dataElement: { id: 'qrur9Dvnyt5' },
                            translations: [],
                            userGroupAccesses: [],
                            attributeValues: [],
                            userAccesses: [],
                        },
                    },
                };

                epic(createActionStreamFor(action))
                    .subscribe(
                        () => {
                            const editedDataElement = store.getState().programStages[0].programStageDataElements[0];

                            expect(editedDataElement).toEqual({
                                lastUpdated: '2017-05-03T13:32:17.730',
                                id: 'd9wIqlzSMgE',
                                created: '2016-04-01T15:07:12.695',
                                displayInReports: false,
                                externalAccess: false,
                                renderOptionsAsRadio: false,
                                allowFutureDate: false,
                                compulsory: false,
                                allowProvidedElsewhere: true,
                                sortOrder: 0,
                                lastUpdatedBy: { id: 'xE7jOejl9FI' },
                                programStage: { id: 'pTo4uMt3xur' },
                                dataElement: { id: 'qrur9Dvnyt5' },
                                translations: [],
                                userGroupAccesses: [],
                                attributeValues: [],
                                userAccesses: [],
                            });
                            done();
                        },
                        done
                    );
            }
        );

        test('should not modify the other dataElements', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENT_EDIT,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    programStageDataElement: {
                        lastUpdated: '2017-05-03T13:32:17.730',
                        id: 'd9wIqlzSMgE',
                        created: '2016-04-01T15:07:12.695',
                        displayInReports: false,
                        externalAccess: false,
                        renderOptionsAsRadio: false,
                        allowFutureDate: false,
                        compulsory: false,
                        allowProvidedElsewhere: true,
                        sortOrder: 0,
                        lastUpdatedBy: { id: 'xE7jOejl9FI' },
                        programStage: { id: 'pTo4uMt3xur' },
                        dataElement: { id: 'qrur9Dvnyt5' },
                        translations: [],
                        userGroupAccesses: [],
                        attributeValues: [],
                        userAccesses: [],
                    },
                },
            };

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        const editedDataElement = store.getState().programStages[0].programStageDataElements[1];

                        expect(editedDataElement).toEqual({
                            lastUpdated: '2017-05-03T13:32:17.729',
                            id: 'FKHaErzkvEF',
                            created: '2016-04-01T15:07:12.723',
                            displayInReports: true,
                            externalAccess: false,
                            renderOptionsAsRadio: true,
                            allowFutureDate: false,
                            compulsory: true,
                            allowProvidedElsewhere: false,
                            sortOrder: 1,
                            lastUpdatedBy: { id: 'xE7jOejl9FI' },
                            programStage: { id: 'pTo4uMt3xur' },
                            dataElement: { id: 'oZg33kd9taw' },
                            translations: [],
                            userGroupAccesses: [],
                            attributeValues: [],
                            userAccesses: [],
                        });
                        done();
                    },
                    done
                );
        });

        test('should emit the state from the store', (done) => {
            const action = {
                type: PROGRAM_STAGE_DATA_ELEMENT_EDIT,
                payload: {
                    programStage: 'pTo4uMt3xur',
                    programStageDataElement: {
                        lastUpdated: '2017-05-03T13:32:17.730',
                        id: 'd9wIqlzSMgE',
                        created: '2016-04-01T15:07:12.695',
                        displayInReports: false,
                        externalAccess: false,
                        renderOptionsAsRadio: false,
                        allowFutureDate: false,
                        compulsory: false,
                        allowProvidedElsewhere: true,
                        sortOrder: 0,
                        lastUpdatedBy: { id: 'xE7jOejl9FI' },
                        programStage: { id: 'pTo4uMt3xur' },
                        dataElement: { id: 'qrur9Dvnyt5' },
                        translations: [],
                        userGroupAccesses: [],
                        attributeValues: [],
                        userAccesses: [],
                    },
                },
            };

            const storeSubscriptionSpy = jest.fn();
            store.subscribe(storeSubscriptionSpy);

            epic(createActionStreamFor(action))
                .subscribe(
                    () => {
                        expect(storeSubscriptionSpy).toHaveBeenCalledTimes(2);
                        done();
                    },
                    done
                );
        });
    });
});
