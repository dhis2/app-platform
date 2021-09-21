import { map, get, filter, flatten, compose, identity, head } from 'lodash/fp';
import Action from 'd2-ui/lib/action/Action';
import log from 'loglevel';
import { Observable } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import { generateUid } from 'd2/lib/uid';
import { getOwnedPropertyJSON } from 'd2/lib/model/helpers/json';

import indicatorGroupsStore from './indicatorGroupsStore';
import dataElementGroupStore from './data-element/dataElementGroupsStore';
import modelToEditStore from './modelToEditStore';
import snackActions from '../Snackbar/snack.actions';
import { afterDeleteHook$ } from '../List/ContextActions';

const extractErrorMessagesFromResponse = compose(
    filter(identity),
    map(get('message')),
    flatten,
    map('errorReports'),
    flatten,
    map('objectReports'),
    get('typeReports'),
);

const objectActions = Action.createActionsFromNames([
    'getObjectOfTypeById',
    'getObjectOfTypeByIdAndClone',
    'saveObject',
    'afterSave',
    'saveAndRedirectToList',
    'update',
    'updateAttribute',
]);

const afterSaveHacks = {
    dataElement: function dataElementAfterSave(model, lastImportedId) {
        const removeUrls = dataElementGroupStore.state.remove
            .filter(id => id)
            .map(remove => `dataElementGroups/${remove}/dataElements/${lastImportedId}`);
        const uniqueRemoveUrls = Array.from((new Set(removeUrls)).values());
        const saveUrls = Object.keys(dataElementGroupStore.state.dataElementGroupValues)
            .map(key => dataElementGroupStore.state.dataElementGroupValues[key])
            .filter(id => id)
            .map(save => `dataElementGroups/${save}/dataElements/${lastImportedId}`);

        const removePromises = getInstance()
            .then((d2) => {
                const api = d2.Api.getApi();

                return Promise.all(uniqueRemoveUrls.map(url => api.delete(url)));
            });

        const savePromises = getInstance()
            .then((d2) => {
                const api = d2.Api.getApi();

                return Promise.all(saveUrls.map(url => api.post(url)));
            });

        return Observable.fromPromise(Promise.all([removePromises, savePromises]));
    },
    indicator: function indicatorAfterSave(model, lastImportedId) {
        const removeUrls = indicatorGroupsStore.state.remove
            .filter(id => id)
            .map(remove => `indicatorGroups/${remove}/indicators/${lastImportedId}`);
        const uniqueRemoveUrls = Array.from((new Set(removeUrls)).values());
        const saveUrls = Object.keys(indicatorGroupsStore.state.indicatorGroupValues)
            .map(key => indicatorGroupsStore.state.indicatorGroupValues[key])
            .filter(id => id)
            .map(save => `indicatorGroups/${save}/indicators/${lastImportedId}`);

        const removePromises = getInstance()
            .then((d2) => {
                const api = d2.Api.getApi();

                return Promise.all(uniqueRemoveUrls.map(url => api.delete(url)));
            });

        const savePromises = getInstance()
            .then((d2) => {
                const api = d2.Api.getApi();

                return Promise.all(saveUrls.map(url => api.post(url)));
            });

        return Observable.fromPromise(Promise.all([removePromises, savePromises]));
    },
    attribute: function attributeAfterSave() {
        // When an attribute is added/edited/deleted, the attributes of all d2 modelDefinitions
        // need to be updated manually, because d2 treats these as static properties
        const d2Promise = getInstance();
        const attributePromise = d2Promise.then(d2 => {
            const api = d2.Api.getApi();
            const queryParams = { fields: ':all,optionSet[:all,options[:all]]', paging: false };
            return api.get('attributes', queryParams);
        })

        return Observable.fromPromise(Promise.all([d2Promise, attributePromise])
            .then(([d2, { attributes }]) => {
                for (const key of Object.keys(d2.models)) {
                    reloadAttributesForModelDefinition(d2.models[key], attributes);
                }
                return Promise.resolve();
            })
        );
    },
};

afterDeleteHook$.subscribe(data => {
    if (data.modelType && data.modelType === 'attribute') {
        afterSaveHacks.attribute();
    }
});

function reloadAttributesForModelDefinition(modelDefinition, attributes) {
    const schemaAttributes = attributes.filter((attributeDescriptor) => {
        return attributeDescriptor[`${modelDefinition.name}Attribute`] === true;
    });

    // clear without reassigning 
    for (const key of Object.keys(modelDefinition.attributeProperties)) {
        delete modelDefinition.attributeProperties[key];
    }

    // Attach fresh attributes
    for (const attribute of schemaAttributes) {
        modelDefinition.attributeProperties[attribute.name] = attribute;
    }
}

function hasAfterSave(model) {
    if (!model || !model.modelDefinition) {
        return false;
    }

    if (Object.keys(afterSaveHacks).indexOf(model.modelDefinition.name) !== -1) {
        return true;
    }
    return false;
}

function getAfterSave(model, lastImportedId) {
    return afterSaveHacks[model.modelDefinition.name](model, lastImportedId);
}

objectActions.getObjectOfTypeById
    .subscribe(({ data, complete, error }) => {
        modelToEditStore
            .getObjectOfTypeById(data)
            .subscribe(complete, error);
    });

objectActions.getObjectOfTypeByIdAndClone
    .subscribe(({ data, complete, error }) => {
        modelToEditStore
            .getObjectOfTypeByIdAndClone(data)
            .subscribe(complete, error);
    });

// Standard save handler
const specialSaveHandlers = ['legendSet', 'dataSet', 'organisationUnit', 'programRule', 'programRuleVariable'];
objectActions.saveObject
    .filter(({ data }) => !specialSaveHandlers.includes(data.modelType))
    .subscribe((action) => {
        const isDirty = modelToEditStore.getState().isDirty();

        const errorHandler = (message) => {
            if (message === 'Response was not a WebMessage with the expected format') {
                action.error('Failed to save: Failed to provide proper error message.');
                return;
            }
            action.error(message);
        };

        const successHandler = () => {
            if (!isDirty) {
                action.complete('no_changes_to_be_saved');
            } else if (hasAfterSave(modelToEditStore.state)) {
                log.debug('Handling after save');
                getAfterSave(modelToEditStore.state, modelToEditStore.state.id)
                    .subscribe(
                        () => action.complete('success'),
                        errorHandler,
                    );
            } else {
                action.complete('success');
            }
        };

        return modelToEditStore
            .save()
            .subscribe(successHandler, errorHandler);
    }, (e) => {
        log.error(e);
    });

// Since the relationship between organisation unit and data set is owned by the data set object,
// organisationUnit.dataSets is not included when the model is saved or when isDirty() is called. In order to enable
// saving this from the organisation unit side, we manually call save() on organisationUnit.dataSets here
objectActions.saveObject
    .filter(({ data }) => data.modelType === 'organisationUnit')
    .subscribe(async ({ complete: completeAction, error: failAction }) => {
        const d2 = await getInstance();
        const organisationUnit = modelToEditStore.getState();

        if (!organisationUnit.isDirty() &&
            !organisationUnit.dataSets.isDirty() &&
            !organisationUnit.programs.isDirty()
        ) {
            completeAction('no_changes_to_be_saved');
        } else {
            // The orgunit has to be saved before it can be linked to datasets so these operations are done sequentially
            organisationUnit.save()
                .then(
                    () => Promise.all([
                        organisationUnit.dataSets.save(),
                        organisationUnit.programs.save(),
                    ]),
                    (error) => {
                        log.error(error);
                        snackActions.show({
                            message: Array.isArray(error.messages)
                                ? error.messages[0].message
                                : d2.i18n.getTranslation('failed_to_save_organisation_unit'),
                            action: 'ok',
                        });
                        failAction(error);
                    },
                )
                .then(() => completeAction('success'), error => failAction(error));
        }
    }, (e) => {
        log.error(e);
    });

// Legend set save handler - uses metadata endpoint instead of legendSets endpoint
objectActions.saveObject
    .filter(({ data }) => data.modelType === 'legendSet')
    .subscribe(async ({ complete, error }) => {
        const legendSet = getOwnedPropertyJSON(modelToEditStore.getState());
        const metadataPayload = {
            legendSets: [legendSet],
        };

        const d2 = await getInstance();
        const api = d2.Api.getApi();

        try {
            const response = await api.post('metadata', metadataPayload);

            if (response.status !== 'ERROR') {
                complete('save_success');
            } else {
                const errorMessages = extractErrorMessagesFromResponse(response);

                error(d2.i18n.getTranslation(
                    'could_not_save_legend_set_($$message$$)',
                    { message: head(errorMessages) || 'Unknown error!' },
                ));
            }
        } catch (e) {
            error(d2.i18n.getTranslation('could_not_save_legend_set'));
            log.error(e);
        }
    }, e => log.error(e));

// Data set save handler - fetches a UID from the API and saves dataSetElements as well
objectActions.saveObject
    .filter(({ data }) => data.modelType === 'dataSet')
    .subscribe(async ({ complete, error }) => {
        const d2 = await getInstance();
        const api = d2.Api.getApi();

        const dataSetModel = modelToEditStore.getState();
        const dataSetPayload = getOwnedPropertyJSON(dataSetModel);

        if (!dataSetPayload.id) {
            const dataSetId = await api.get('system/uid', { limit: 1 }).then(({ codes }) => codes[0]);
            dataSetPayload.id = dataSetId;
        }

        const dataSetElements = Array
            .from(dataSetModel.dataSetElements ? dataSetModel.dataSetElements.values() : [])
            .map(({ dataSet, dataElement, ...other }) => ({
                dataSet: { ...dataSet, id: dataSet.id || dataSetPayload.id },
                ...other,
                dataElement: {
                    id: dataElement.id,
                },
            }));

        dataSetPayload.dataSetElements = dataSetElements;

        const metadataPayload = {
            dataSets: [dataSetPayload],
        };

        try {
            const response = await api.post('metadata', metadataPayload);

            if (response.status === 'OK') {
                complete('save_success');
            } else {
                const errorMessages = extractErrorMessagesFromResponse(response);

                error(d2.i18n.getTranslation(
                    'could_not_save_data_set_($$message$$)',
                    { message: head(errorMessages) || 'Unknown error!' },
                ));
            }
        } catch (e) {
            error(d2.i18n.getTranslation('could_not_save_data_set'));
            log.error(e);
        }
    });

// Program rule save handler - save program rule and program rule actions in one go
objectActions.saveObject
    .filter(({ data }) => data.modelType === 'programRule')
    .subscribe(async ({ complete, error }) => {
        const d2 = await getInstance();
        const api = d2.Api.getApi();

        if (!modelToEditStore.getState().program) {
            error(d2.i18n.getTranslation('could_not_save_program_rule_no_program_specified'));
            return;
        }

        const programRuleId = modelToEditStore.getState().id ||
            (await api.get('/system/id')).codes[0];

        // DHIS2-2342: The client should not need to generate a
        // new for the programRuleAction here to avoid highjacking the
        // reference to original. Cloning these complex objects should
        // be done on the backend to solve the entire category of bugs
        // related to cloning.
        const programRulesActionsWithNewUid = modelToEditStore.getState()
            .programRuleActions
            .toArray()
            .map(action => Object.assign(action, {
                programRule: { id: programRuleId },
                id: generateUid(),
                href: '<strip from clone>',
            }));

        const metadataPayload = {
            programRules: [Object.assign(getOwnedPropertyJSON(modelToEditStore.getState()), {
                program: { id: modelToEditStore.getState().program.id },
                id: programRuleId,
                programRuleActions: programRulesActionsWithNewUid,
            })],
            programRuleActions:
                programRulesActionsWithNewUid.map(getOwnedPropertyJSON),
        };

        try {
            const response = await api.post('metadata', metadataPayload);

            if (response.status === 'OK') {
                complete('save_success');
            } else {
                const errorMessages = extractErrorMessagesFromResponse(response);

                error(d2.i18n.getTranslation(
                    'could_not_save_program_rule_($$message$$)',
                    { message: head(errorMessages) || 'Unknown error!' },
                ));
            }
        } catch (e) {
            error(d2.i18n.getTranslation('could_not_save_program_rule'));
            log.error(e);
        }
    });

// Program rule variable save handler - uncomplicate program
objectActions.saveObject
    .filter(({ data }) => data.modelType === 'programRuleVariable')
    .subscribe(async ({ complete, error }) => {
        const editModel = modelToEditStore.getState();

        if (!editModel.program || !editModel.program.id) {
            const d2 = await getInstance();
            error(d2.i18n.getTranslation('could_not_save_program_rule_variable_no_program_specified'));
            return;
        }

        const model = Object.assign(
            editModel, {
                program: { id: editModel.program.id },
                programStage: editModel.programStage ? { id: editModel.programStage.id } : undefined,
                dataElement: editModel.dataElement ? { id: editModel.dataElement.id } : undefined,
                trackedEntityAttribute: editModel.trackedEntityAttribute
                    ? { id: editModel.trackedEntityAttribute.id }
                    : undefined,
            });

        model.save()
            .then(() => complete('save_success'))
            .catch((err) => {
                error(err.messages ? err.messages[0].message : err);
            });
    });

objectActions.update.subscribe((action) => {
    const { fieldName, value } = action.data;
    const modelToEdit = modelToEditStore.getState();

    if (modelToEdit) {
        if (modelToEdit.attributes && Object.keys(modelToEdit.attributes).indexOf(fieldName) >= 0) {
            log.debug(`${fieldName} is a custom attribute. Setting ${fieldName} to ${value}`);
            modelToEdit.attributes[fieldName] = value;
            log.debug(`Value is now: ${modelToEdit.attributes[fieldName]}`);

            modelToEditStore.setState(modelToEdit);

            return action.complete();
        }

        if (!(modelToEdit[fieldName] &&
            modelToEdit[fieldName].constructor &&
            modelToEdit[fieldName].constructor.name === 'ModelCollectionProperty')
        ) {
            log.debug(`Change ${fieldName} to ${value}`);
            modelToEdit[fieldName] = value;
            log.debug(`Value is now: ${modelToEdit.dataValues[fieldName]}`);
        } else {
            log.debug('Not updating anything');
        }

        modelToEditStore.setState(modelToEdit);

        action.complete();
    } else {
        log.error('modelToEdit does not exist');
        action.error();
    }
});

objectActions.updateAttribute.subscribe((action) => {
    const { attributeName, value } = action.data;
    const modelToEdit = modelToEditStore.getState();

    modelToEdit.attributes[attributeName] = value;

    modelToEditStore.setState(modelToEdit);

    action.complete();
});

export default objectActions;
