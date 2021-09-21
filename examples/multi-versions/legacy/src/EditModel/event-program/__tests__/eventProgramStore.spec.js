import { Observable } from 'rxjs';
import store, { isStoreStateDirty, getMetaDataToSend } from '../eventProgramStore';
import ModelDefinition from 'd2/lib/model/ModelDefinition';
import ModelDefinitions from 'd2/lib/model/ModelDefinitions';
import programSchema from '../../../__fixtures__/schemas/program.json';
import programStageSchema from '../../../__fixtures__/schemas/programStage.json';
import programNotificationTemplateSchema from '../../../__fixtures__/schemas/programNotificationTemplate.json';
import dataEntryFormSchema from '../../../__fixtures__/schemas/dataEntryForm.json';
import { noop } from 'lodash/fp';

describe('Event Program Store', () => {
    let mockState;
    let program;
    let programStage;
    let dataEntryForm;
    let programStageNotification;
    let modelDefinitions;

    beforeAll(() => {
        // Mock fetch
        global.fetch = noop;

        program = ModelDefinition.createFromSchema(programSchema);
        programStage = ModelDefinition.createFromSchema(programStageSchema);
        programStageNotification = ModelDefinition.createFromSchema(programNotificationTemplateSchema);
        dataEntryForm = ModelDefinition.createFromSchema(dataEntryFormSchema);

        modelDefinitions = ModelDefinitions.getModelDefinitions();

        // Only add the modelDefs when they have not yet been added (This is kind of funky due to ModelDefinitions being a singleton)
        modelDefinitions.program || modelDefinitions.add(program);
        modelDefinitions.programStage || modelDefinitions.add(programStage);
        modelDefinitions.programNotificationTemplate || modelDefinitions.add(programStageNotification);
        modelDefinitions.programNotificationTemplate || modelDefinitions.add(dataEntryForm);
    });

    beforeEach(() => {
        mockState = {
            program: program.create(),
            programStages: [programStage.create({ id: 'selCNHPqm5g', notificationTemplates: [] })],
            programStageNotifications: {
                selCNHPqm5g: [
                    programStageNotification.create(),
                ],
            },
            dataEntryFormForProgramStage: {
                selCNHPqm5g: dataEntryForm.create(),
            },
        };

        store.setState(mockState);
    });

    afterAll(() => {
        delete global.fetch;
    });

    test('should be an Observable', () => {
        expect(store).toBeInstanceOf(Observable);
    });

    test('should return the current state when requesting it', () => {
        expect(store.getState()).toEqual(mockState);
    });

    test('should emit the status after subscribing to it', (done) => {
        store
            .take(1)
            .do(state => expect(state).toEqual(mockState))
            .subscribe(() => done(), done);
    });

    test('should not accept invalid properties for the state', () => {
        expect(() => store.setState({ name: 'John' })).toThrowError('You are attempting to set an invalid state onto the eventProgramStore');
    });

    test('should throw if the passed state is not an object', () => {
        expect(() => store.setState()).toThrowError('You are attempting to set a state that is a non object');
    });

    xit('should merge the state with the old state', () => {

    });

    describe('helpers', () => {
        describe('isStoreStateDirty', () => {
            test('should return false when the state has not changed', () => {
                expect(isStoreStateDirty(mockState)).toBe(false);
            });

            test('should return true when the program has changed', () => {
                expect(isStoreStateDirty(mockState)).toBe(false);

                mockState.program.name = 'Malaria Prevention';

                expect(isStoreStateDirty(mockState)).toBe(true);
            });

            test('should return true when the programStage has changed', () => {
                expect(isStoreStateDirty(mockState)).toBe(false);

                mockState.programStages[0].name = 'Stage 1';

                expect(isStoreStateDirty(mockState)).toBe(true);
            });

            test('should return true when a programStageNotification was changed', () => {
                expect(isStoreStateDirty(mockState)).toBe(false);

                mockState.programStageNotifications.selCNHPqm5g[0].name = 'Email on completion';

                expect(isStoreStateDirty(mockState)).toBe(true);
            });

            test('should return true when a dataEntryForm was changed', () => {
                expect(isStoreStateDirty(mockState)).toBe(false);

                mockState.dataEntryFormForProgramStage.selCNHPqm5g.htmlCode = '<input id="id-id-val" />';

                expect(isStoreStateDirty(mockState)).toBe(true);
            });
        });

        describe('getMetaDataToSend', () => {
            test('should return an empty payload when nothing was updated', () => {
                expect(getMetaDataToSend(mockState)).toEqual({});
            });

            test(
                'should return the programs array with a single program when the program was updated',
                () => {
                    mockState.program.name = 'Malaria Prevention';

                    expect(getMetaDataToSend(mockState)).toEqual({
                        programs: [{
                            name: 'Malaria Prevention',
                            notificationTemplates: [],
                            programStages: [],
                            expiryDays: 0,
                            completeEventsExpiryDays: 0,
                            version: 0,
                        }],
                    });
                }
            );

            test(
                'should return the programStage array when a programStage was updated',
                () => {
                    mockState.programStages[0].name = 'Stage 1';

                    expect(getMetaDataToSend(mockState)).toEqual({
                        programStages: [{
                            id: 'selCNHPqm5g',
                            name: 'Stage 1',
                            notificationTemplates: [],
                        }],
                    });
                }
            );

            test(
                'should return the programStage and the programNotificationTemplate when a programNotificationTemplate was added',
                () => {
                    const notification = programStageNotification.create({ id: 'pdKXh2PmaLs' });
                    notification.name = 'Sms template';

                    mockState.programStages[0].notificationTemplates.add(notification);
                    mockState.programStageNotifications.selCNHPqm5g = [notification];

                    expect(getMetaDataToSend(mockState)).toEqual({
                        programStages: [{
                            id: 'selCNHPqm5g',
                            notificationTemplates: [
                                { id: 'pdKXh2PmaLs' },
                            ],
                        }],
                        programNotificationTemplates: [{
                            id: 'pdKXh2PmaLs',
                            name: 'Sms template',
                        }],
                    });
                }
            );
        });
    });
});
