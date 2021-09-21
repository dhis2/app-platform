import log from 'loglevel';
import Action from 'd2-ui/lib/action/Action';
import isArray from 'd2-utilizr/lib/isArray';
import { getInstance } from 'd2/lib/d2';
import { has } from 'lodash/fp';

import snackActions from '../../Snackbar/snack.actions';
import modelToEditStore from '../modelToEditStore';
import { optionDialogStore, optionsForOptionSetStore } from './stores';
import { isAttribute } from '../form-helpers/fieldChecks';

const actions = Action.createActionsFromNames([
    'saveOption',
    'setActiveModel',
    'closeOptionDialog',
    'getOptionsFor',
    'deleteOption',
    'updateModel',
], 'optionSet');

export async function loadOptionsForOptionSet(optionSetId, paging) {
    const d2 = await getInstance();

    return d2.models.option
        .filter().on('optionSet.id').equals(optionSetId)
        .list({ fields: ':all,attributeValues[:owner,attribute[id,name]', paging });
}

function processResponse(options) {
    if (!options.pager.hasNextPage() && !options.pager.hasPreviousPage()) {
        return modelToEditStore
            .take(1)
            .subscribe((model) => {
                const optionsInOrder = model.options
                    .toArray()
                    .map(({ id }) => options.get(id))
                    .filter(option => option);

                optionsForOptionSetStore.setState({
                    onePage: true,
                    isLoading: false,
                    options: optionsInOrder,
                });
            });
    }

    const state = {
        options: options.toArray(),
        getNextPage: () => {
            options.pager.getNextPage()
                .then(processResponse);
        },
        getPreviousPage: () => {
            options.pager.getPreviousPage()
                .then(processResponse);
        },
        pager: options.pager,
        onePage: false,
        isLoading: false,
    };

    optionsForOptionSetStore.setState(state);

    return state;
}

actions.updateModel
    .subscribe(({ data: [modelToEdit, field, value] }) => {
        const model = modelToEdit;

        if (isAttribute(model, { name: field })) {
            modelToEdit.attributes[field] = value;
            log.debug(`Value for custom attribute '${field}' is now: ${modelToEdit.attributes[field]}`);
        } else {
            model[field] = value;
            log.debug(`Value for '${field}' is now: ${modelToEdit[field]}`);
        }

        optionDialogStore.setState({
            ...optionDialogStore.state,
            model,
        });
    });

actions.setActiveModel
    .subscribe(async ({ data: model }) => {
        const d2 = await getInstance();
        let modelToSave = model;

        // When no model is passed we create a new model
        if (isArray(model) && !model.length) {
            modelToSave = d2.models.option.create();
        }

        optionDialogStore.setState({
            ...optionDialogStore.state,
            isDialogOpen: true,
            model: modelToSave,
        });
    });

actions.saveOption
    .subscribe(({ data: [model, parentModel], complete, error }) => {
        const isAdd = !model.id;

        // Options must have a sortOrder and an optionSet, otherwise saving might not happen correctly
        // For example, prior to adding this, the `optionSet` would be not be saved correctly if a `style` was also in the payload.
        if (isAdd) {
            model.sortOrder = (parentModel && parentModel.options.size + 1) || 1;
            model.optionSet = {
                id: parentModel.id,
            };
        }

        model.save()
            .then(() => {
                if (isAdd) {
                    // TODO: Use collection patching to solve this.
                    parentModel.options.add(model);
                    return parentModel.save();
                }
                return true;
            })
            .then(complete)
            .catch((response) => {
                if (has('response.errrorReports[0].message', response)) {
                    return error({
                        message: response.response.errorReports[0].message,
                        translate: false,
                    });
                }

                return error({
                    message: 'option_failed_to_save',
                    translate: true,
                });
            });
    });

actions.getOptionsFor
    .subscribe(async ({ data: model, complete }) => {
        optionsForOptionSetStore.setState({
            isLoading: true,
            options: [],
        });

        if (model && model.id) {
            loadOptionsForOptionSet(model.id, true)
                .then(processResponse)
                .then(() => complete());
        }
    });

actions.closeOptionDialog
    .subscribe(() => {
        optionDialogStore.setState({
            ...optionDialogStore.state,
            isDialogOpen: false,
        });
    });

actions.deleteOption
    .subscribe(async ({ data: [modelToDelete, modelParent], complete, error }) => {
        const d2 = await getInstance();
        const api = d2.Api.getApi();

        if (!modelParent.id && modelToDelete.id) {
            return error('unable_to_delete_due_to_missing_id');
        }

        const deleteMessage = d2.i18n.getTranslation('option_$$name$$_deleted', { name: modelToDelete.name });

        return api.delete(`${modelParent.modelDefinition.apiEndpoint}/${modelParent.id}/options/${modelToDelete.id}`)
            .then(() => modelToDelete.delete())
            .then(() => snackActions.show({ message: deleteMessage }))
            .then(() => actions.getOptionsFor(modelParent))
            .then(() => modelParent.options.delete(modelToDelete.id))
            .then(complete)
            .catch(error);
    });

export default actions;
