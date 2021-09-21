import { Observable } from 'rxjs';
import { get, set } from 'lodash/fp';
import log from 'loglevel';

const EMPTY_ACTION = '@@dhis2/EMPTY_ACTION';
const emptyAction$ = Observable.of({ type: EMPTY_ACTION });

function isAttributeValue(model, fieldName) {
    return model.attributes && Object.keys(model.attributes).indexOf(fieldName) >= 0;
}

function updateAttributeValue(model, fieldName, value) {
    log.debug(`${fieldName} is a custom attribute. Setting ${fieldName} to ${value}`);
    model.attributes[fieldName] = value;
    log.debug(`Value is now: ${model.attributes[fieldName]}`);
    return model;
}

function updateRegularValue(model, fieldName, value) {
    log.debug(`${fieldName} is a regular field. Setting ${fieldName} to ${value}`);
    model[fieldName] = value;
    log.debug(`Value is now: ${model[fieldName]}`);
    return model;
}

/**
 * Convenience method to create an epic that handles modifying a d2.Model instance in a custom rxjs store.
 * This action that will reply to can be provided and will be passed to the `.ofType(actionType)` of the Epic.
 * The `storeProp` will be used to pick the model from the state of the `store`. The updated model will be written back to the same property.
 *
 * @param {string} actionType The type of the action to respond to.
 * @param {Store} store The store where to retrieve the model from.
 * @param {string} storeProp The property that should be used to pick the prop from the store.
 * @returns {function(Action): Observable<R>}
 *
 * @example
 * ```
 * const epic = createModelToEditEpic(MODEL_TO_EDIT_FIELD_CHANGED, eventProgramStore, 'program');
 * ```
 */
export function createModelToEditEpic(actionType, store, storeProp) {
    const storePropGetter = get(storeProp);
    const storePropSetter = set(storeProp);

    return action$ => action$
        .ofType(actionType)
        .map(action => action.payload)
        .flatMap(({ field, value }) => store
            .take(1)
            .map(storePropGetter)
            .map((model) => {
                // Apply the new value to the model
                if (isAttributeValue(model, field)) {
                    updateAttributeValue(model, field, value);
                } else {
                    updateRegularValue(model, field, value);
                }

                // Write back the state to the store
                store.setState(
                    storePropSetter(model, { ...store.getState() }),
                );
            }),
        )
        .flatMapTo(emptyAction$);
}

export function addChangedFieldValueToModel({ field, value }, store, storeProp) {
    const storePropGetter = get(storeProp);
    const storePropSetter = set(storeProp);

    return store
        .take(1)
        .map(storePropGetter)
        .map((model) => {
            // Apply the new value to the model
            if (isAttributeValue(model, field)) {
                updateAttributeValue(model, field, value);
            } else {
                updateRegularValue(model, field, value);
            }

            // Write back the state to the store
            store.setState(
                storePropSetter(model, { ...store.getState() }),
            );
            return model;
        });
}

export function createModelToEditProgramStageEpic(actionType, store, storeProp) {
    const storePropGetter = get(storeProp);

    return action$ => action$
        .ofType(actionType)
        .map(action => action.payload)
        .flatMap(({ stageId, field, value }) => store
            .take(1)
            .map(storePropGetter)
            .map((programStages) => {
                const index = programStages.findIndex(stage => stage.id === stageId);
                const model = programStages[index];
                const storePropSetter = set(`${storeProp}[${index}]`);
                // Apply the new value to the model
                if (isAttributeValue(model, field)) {
                    updateAttributeValue(model, field, value);
                } else {
                    updateRegularValue(model, field, value);
                    /* ProgramStages does not get refreshed from the server after editing a stage,
                    and we therefore copy the name to displayName to show in lists etc. This does not get sent
                    to the server, and upon reloading the model, the server-defined displayName will be shown */

                    if (field === 'name') {
                        model.dataValues.displayName = value
                    }
                }
                // Write back the state to the store
                store.setState(
                    storePropSetter(model, store.getState()),
                );
            }),
        )
        .flatMapTo(emptyAction$);
}
