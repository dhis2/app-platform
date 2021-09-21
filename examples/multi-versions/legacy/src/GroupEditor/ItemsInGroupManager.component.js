import React from 'react';

import TextField from 'material-ui/TextField/TextField';
import log from 'loglevel';

import d2lib from 'd2/lib/d2';
import ModelTypeSelector from './ModelTypeSelector.component';
import Store from 'd2-ui/lib/store/Store';
import ItemSelector from './ItemSelector.component';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import GroupEditor from 'd2-ui/lib/group-editor/GroupEditor.component';

export default React.createClass({
    mixins: [Translate],

    contextTypes: {
        d2: React.PropTypes.object,
    },

    getInitialState() {
        const itemStore = Store.create();
        const assignedItemStore = Store.create();
        const itemListStore = Store.create();

        itemStore.state = [];
        assignedItemStore.state = [];

        return {
            itemListStore,
            itemStore,
            assignedItemStore,
            filterText: '',
            showGroupEditor: false,
        };
    },

    renderGroupEditor() {
        if (!this.state.showGroupEditor) {
            return null;
        }

        return (
            <div>
                <ItemSelector
                    value={this.state.modelToEdit || this.state.itemListStore.state[0]}
                    itemListStore={this.state.itemListStore}
                    onItemSelected={this._workItemChanged}
                />
                <TextField
                    fullWidth
                    hintText={this.getTranslation('search_available_selected_items')}
                    defaultValue={this.state.filterText}
                    onChange={this._setFilterText}
                />
                <GroupEditor
                    itemStore={this.state.itemStore}
                    assignedItemStore={this.state.assignedItemStore}
                    onAssignItems={this._assignItems}
                    onRemoveItems={this._removeItems}
                    filterText={this.state.filterText}
                />
            </div>
        );
    },

    createUrls(items) {
        const { modelToEdit, itemDefinition } = this.state;

        return items
            .map(id => `${modelToEdit.modelDefinition.plural}/${modelToEdit.id}/${itemDefinition}/${id}`);
    },

    render() {
        const d2 = this.context.d2;

        const accessibleGroups = ['indicatorGroup', 'dataElementGroup', 'categoryOptionGroup']
            .filter(groupName => d2.currentUser.canCreate(d2.models[groupName]));

        const contentStyle = {
            padding: '2rem',
        };

        return (
            <div style={contentStyle}>
                <ModelTypeSelector
                    nameListFilter={accessibleGroups}
                    onChange={this._typeChanged}
                />
                {this.renderGroupEditor()}
            </div>
        );
    },

    _assignItems(items) {
        const requests = this.createUrls(items)
            .map(url => d2lib
                .getInstance()
                .then(d2 => d2.Api.getApi())
                .then(api => api.post(url))
            );

        return Promise.all(requests)
            .then(() => {
                const itemDefinition = this.state.modelToEdit.modelDefinition.name.replace('Group', '');

                return d2lib.getInstance()
                    .then(d2 => Promise.all([d2, d2.models[this.state.modelToEdit.modelDefinition.name].get(this.state.modelToEdit.id)]))
                    .then(([d2, fullModel]) => {
                        this.state.assignedItemStore.setState(fullModel[d2.models[itemDefinition].plural]);
                        this.setState({
                            modelToEdit: fullModel,
                        });
                    })
                    .catch(message => log.error(message));
            });
    },

    _removeItems(items) {
        const requests = this.createUrls(items)
            .map(url => d2lib.getInstance()
                    .then(d2 => d2.Api.getApi())
                    .then(api => api.delete(url)));

        return Promise.all(requests)
            .then(() => {
                const itemDefinition = this.state.modelToEdit.modelDefinition.name.replace('Group', '');

                return d2lib.getInstance()
                    .then(d2 => Promise.all([d2, d2.models[this.state.modelToEdit.modelDefinition.name].get(this.state.modelToEdit.id)]))
                    .then(([d2, fullModel]) => {
                        this.state.assignedItemStore.setState(fullModel[d2.models[itemDefinition].plural]);
                        this.setState({
                            modelToEdit: fullModel,
                        });
                    })
                    .catch(message => log.error(message));
            });
    },

    _typeChanged(modelDef) {
        if (!modelDef) {
            return;
        }

        modelDef.list({ paging: false, fields: 'id,displayName,name' })
            .then(modelCollection => modelCollection.toArray())
            .then(models => this.state.itemListStore.setState(models))
            .then(() => this.setState({ showGroupEditor: true }))
            .catch(message => log.error(message));
    },

    _setFilterText(event) {
        this.setState({
            filterText: event.target.value,
        });
    },

    _workItemChanged(model) {
        const itemDefinition = model.modelDefinition.name.replace('Group', '');

        d2lib.getInstance()
            .then((d2) => {
                if (!d2.models[itemDefinition]) {
                    return Promise.reject(`This groupType does not have a model named: ${itemDefinition}`);
                }

                const availablePromise = d2.models[itemDefinition].list({ paging: false });
                const modelPromise = d2.models[model.modelDefinition.name].get(model.id);

                Promise.all([availablePromise, modelPromise])
                    .then(([availableItems, fullModel]) => {
                        this.state.itemStore.setState(availableItems);
                        this.state.assignedItemStore.setState(fullModel[d2.models[itemDefinition].plural]);
                        this.setState({
                            modelToEdit: fullModel,
                            itemDefinition: d2.models[itemDefinition].plural,
                        });
                    });
            })
            .catch(message => log.error(message));
    },

    reset() {
        if (!this.state.modelToEdit) { return; }

        const itemDefinition = this.state.modelToEdit.modelDefinition.name.replace('Group', '');

        d2lib.getInstance()
            .then(d2 => Promise
                    .all([d2, d2.models[this.state.modelToEdit.modelDefinition.name].get(this.state.modelToEdit.id)]))
            .then(([d2, fullModel]) => {
                this.state.assignedItemStore.setState(fullModel[d2.models[itemDefinition].plural]);
                this.setState({
                    modelToEdit: fullModel,
                });
            })
            .catch(message => log.error(message));
    },
});
