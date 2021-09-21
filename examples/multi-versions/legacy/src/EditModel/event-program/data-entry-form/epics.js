import { Observable } from 'rxjs';
import { get, find, isEqual, compose } from 'lodash/fp';
import { generateUid } from 'd2/lib/uid';
import { getInstance } from 'd2/lib/d2';
import log from 'loglevel';
import { combineEpics } from 'redux-observable';

import showSnackBarMessageEpic from '../../../Snackbar/epics';
import { notifyUser } from '../../actions';
import {
    PROGRAM_STAGE_DATA_ENTRY_FORM_FIELD_CHANGED,
    PROGRAM_STAGE_DATA_ENTRY_FORM_REMOVE,
    PROGRAM_DATA_ENTRY_FORM_FIELD_CHANGED,
    PROGRAM_DATA_ENTRY_FORM_REMOVE,
} from './actions';
import eventProgramStore from '../eventProgramStore';

const d2$ = Observable.fromPromise(getInstance());

const findById = id => find(compose(isEqual(id), get('id')));
const findProgramStageById = programStageId =>
    compose(findById(programStageId), get('programStages'));

const dataEntryFormChangedEpic = action$ =>
    action$
        .ofType(PROGRAM_STAGE_DATA_ENTRY_FORM_FIELD_CHANGED)
        .combineLatest(d2$, (action, d2) => ({ action, d2 }))
        .mergeMap(({ action, d2 }) => {
            const fieldName = get('payload.field', action);
            const value = get('payload.value', action);
            const programStageId = get('payload.programStage', action);
            const storeState = eventProgramStore.getState();
            let dataEntryFormForProgramStage =
                storeState.dataEntryFormForProgramStage;

            const programStage = findProgramStageById(programStageId)(
                storeState
            );
            let dataEntryForm = dataEntryFormForProgramStage[programStageId];

            // Set the uid in case we're dealing with a new form
            if (!dataEntryForm || !dataEntryForm.id) {
                const id = generateUid();
                dataEntryForm = d2.models.dataEntryForm.create({
                    id,
                    name: programStage.name,
                });
                dataEntryFormForProgramStage[programStageId] = dataEntryForm;
            }

            log.debug('Setting', fieldName, 'to', value);
            dataEntryForm[fieldName] = value;

            if (!programStage.dataEntryForm) {
                programStage.dataEntryForm = dataEntryForm;
            }

            // Force a state update on the store
            eventProgramStore.setState({});
            return Observable.empty();
        });

const dataEntryFormRemoveEpic = action$ =>
    action$
        .ofType(PROGRAM_STAGE_DATA_ENTRY_FORM_REMOVE)
        .combineLatest(d2$, (action, d2) => ({ action, d2 }))
        .mergeMap(({ action, d2 }) => {
            const storeState = eventProgramStore.getState();
            const programStageId = action.payload;
            const programStage = findProgramStageById(programStageId)(
                storeState
            );
            const dataEntryFormsForProgramStages =
                storeState.dataEntryFormForProgramStage;

            return Observable.fromPromise(
                dataEntryFormsForProgramStages[programStageId].delete()
            )
                .mergeMap(() => {
                    programStage.dataEntryForm = undefined;
                    dataEntryFormsForProgramStages[
                        programStageId
                    ] = undefined

                    eventProgramStore.setState({});

                    return [
                        notifyUser({
                            message: 'item_deleted_successfully',
                            translate: true,
                        }),
                    ];
                })
                .catch(v => {
                    //probably not saved to server, clear local and ignore
                    if (v.httpStatusCode === 404) {
                        programStage.dataEntryForm = undefined;
                        dataEntryFormsForProgramStages[
                            programStageId
                        ] = undefined

                        eventProgramStore.setState({});
                        return Observable.empty();
                    }
                    //actual error
                    log.error(v);
                    return [notifyUser({ message: v.message })];
                });
        });

//Used for custom registration form. On the program object

const ProgramDataEntryFormChangedEpic = action$ =>
    action$
        .ofType(PROGRAM_DATA_ENTRY_FORM_FIELD_CHANGED)
        .combineLatest(d2$, (action, d2) => ({ action, d2 }))
        .mergeMap(({ action, d2 }) => {
            const fieldName = get('payload.field', action);
            const value = get('payload.value', action);
            const storeState = eventProgramStore.getState();

            const program = storeState.program;
            let dataEntryForm = storeState.program.dataEntryForm;

            // Set the uid in case we're dealing with a new form
            if (!dataEntryForm || !dataEntryForm.id) {
                const id = generateUid();
                dataEntryForm = d2.models.dataEntryForm.create({
                    id,
                    name: program.displayName,
                });
            }
            log.debug('Setting', fieldName, 'to', value);
            dataEntryForm[fieldName] = value;

            if (!program.dataEntryForm || !program.dataEntryForm.id) {
                program.dataEntryForm = dataEntryForm;
            }

            // Force a state update on the store
            eventProgramStore.setState({});
            return Observable.empty();
        });

const ProgramDataEntryFormRemoveEpic = action$ =>
    action$
        .ofType(PROGRAM_DATA_ENTRY_FORM_REMOVE)
        .combineLatest(d2$, (action, d2) => ({ action, d2 }))
        .mergeMap(({ action, d2 }) => {
            const storeState = eventProgramStore.getState();
            const program = storeState.program;

            return Observable.fromPromise(program.dataEntryForm.delete())
                .mergeMap(res => {
                    program.dataEntryForm = undefined;
                    eventProgramStore.setState({});
                    return [
                        notifyUser({
                            message: 'item_deleted_successfully',
                            translate: true,
                        }),
                    ];
                })
                .catch(v => {
                    if (v.httpStatusCode === 404) {
                        program.dataEntryForm = undefined;
                        eventProgramStore.setState({});
                        return Observable.empty();
                    }
                    log.error(v);
                    return [notifyUser({ message: v.message })];
                });
        });

export default combineEpics(
    dataEntryFormChangedEpic,
    dataEntryFormRemoveEpic,
    ProgramDataEntryFormChangedEpic,
    ProgramDataEntryFormRemoveEpic,
    showSnackBarMessageEpic,
);
