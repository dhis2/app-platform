import React from 'react';
import Store from 'd2-ui/lib/store/Store';
import { getInstance } from 'd2/lib/d2';
import GroupEditor from 'd2-ui/lib/group-editor/GroupEditor.component';
import GroupEditorWithOrdering from 'd2-ui/lib/group-editor/GroupEditorWithOrdering.component';
import Action from 'd2-ui/lib/action/Action';
import Translate from 'd2-ui/lib/i18n/Translate.mixin';
import TextField from 'material-ui/TextField/TextField';
import log from 'loglevel';
import QuickAddLink from './helpers/QuickAddLink.component';
import RefreshMask from './helpers/RefreshMask.component';

export const multiSelectActions = Action.createActionsFromNames([
    'addItemsToModelCollection',
    'removeItemsFromModelCollection',
]);

function unique(values) {
    return Array.from((new Set(values)).values());
}

function filterModelsMapOnItemIds(map, items) {
    return Array
        .from(map.values())
        .filter(model => items.indexOf(model.id) !== -1);
}

multiSelectActions.addItemsToModelCollection
    .subscribe(({ data, complete, error }) => {
        try {
            const [modelsToAdd, propertyName, model] = data;
            if (!model[propertyName]) {
                error(`Model does not have property called '${propertyName}'`);
            }
            modelsToAdd
                .forEach((itemToAdd) => {
                    model[propertyName].add(itemToAdd);
                });

            complete();
        } catch (e) {
            log.error(e);
        }
    });

multiSelectActions.removeItemsFromModelCollection
    .subscribe(({ data, complete, error }) => {
        const [modelsToRemove, propertyName, model] = data;

        if (!model[propertyName]) {
            error(`Model does not have property called '${propertyName}'`);
        }

        modelsToRemove
            .forEach((itemToRemove) => {
                model[propertyName].remove(itemToRemove);
            });

        complete();
    });

function isOrganisationUnitLevelReference(referenceProperty, modelDefinition) {
    return ['dataElement.aggregationLevels', 'validationRule.organisationUnitLevels']
        .indexOf(`${modelDefinition.name}.${referenceProperty}`) > -1;
}

// TODO: Refactor to es2015 class
export default React.createClass({
    propTypes: {
        referenceType: React.PropTypes.string.isRequired,
        referenceProperty: React.PropTypes.string.isRequired,
        model: React.PropTypes.object.isRequired,
        labelText: React.PropTypes.string.isRequired,
        onChange: React.PropTypes.func.isRequired,
        value: React.PropTypes.oneOfType([
            React.PropTypes.shape({ values: React.PropTypes.func.isRequired }),
            React.PropTypes.arrayOf(React.PropTypes.func),
            React.PropTypes.array,
        ]),
    },

    mixins: [Translate],

    getInitialState() {
        const itemStore = Store.create();
        const assignedItemStore = Store.create();

        itemStore.state = [];
        assignedItemStore.state = [];

        return {
            itemStore,
            assignedItemStore,
            filterText: '',
            isRefreshing: false,
            canCreate: false,
        };
    },

    componentWillMount() {
        if (!this.props.referenceType) {
            return;
        }

        getInstance()
            .then(this.checkCreateAuthority)
            .then(this.loadAvailableItems)
            .then(this.populateItemStore)
            .then(this.populateAssignedStore);
    },

    componentWillReceiveProps(newProps) {
        if (this.props.queryParamFilter !== newProps.queryParamFilter) {
            // Reload the available items since the filter for the objects changed
            this.reloadAvailableItems();

            // The selected items need to be reset. The filter change likely invalidated the selection
            this.state.assignedItemStore.setState([]);
            this.props.model[this.props.referenceProperty].clear();
        }
    },

    renderGroupEditor() {
        if (this.props.model.modelDefinition.modelValidations[this.props.referenceProperty] &&
            this.props.model.modelDefinition.modelValidations[this.props.referenceProperty].ordered &&
            !isOrganisationUnitLevelReference(this.props.referenceProperty, this.props.model.modelDefinition)) {/* TODO: The aggregation levels should either not be "ordered" or should be returned from the API properly */
            return (
                <GroupEditorWithOrdering
                    itemStore={this.state.itemStore}
                    assignedItemStore={this.state.assignedItemStore}
                    onAssignItems={this._assignItems}
                    onRemoveItems={this._removeItems}
                    onOrderChanged={this._orderChanged}
                    height={250}
                    filterText={this.state.filterText}
                />
            );
        }

        return (
            <GroupEditor
                itemStore={this.state.itemStore}
                assignedItemStore={this.state.assignedItemStore}
                onAssignItems={this._assignItems}
                onRemoveItems={this._removeItems}
                height={250}
                filterText={this.state.filterText}
            />
        );
    },

    render() {
        const styles = {
            labelStyle: {
                float: 'left',
                position: 'relative',
                display: 'block',
                width: 'calc(100% - 60px)',
                lineHeight: '24px',
                color: 'rgba(0,0,0,0.5)',
                marginTop: '1rem',
                fontSize: 16,
                fontWeight: 500,
            },

            labelWrap: {
                display: 'flex',
                marginTop: 24,
                height: 36,
            },
            fieldWrap: {
                position: 'relative',
            },
        };

        return (
            <div style={{ ...styles.fieldWrap, ...this.props.style }}>
                {this.state.isRefreshing ? <RefreshMask /> : null }
                <div style={styles.labelWrap}>
                    <label style={styles.labelStyle}>{this.props.labelText || ''}</label>
                    {this.state.canCreate ? (
                        <QuickAddLink
                            referenceType={this.props.referenceType}
                            onRefreshClick={this.reloadAvailableItems}
                        />
                    ) : null}
                </div>
                <TextField
                    fullWidth
                    hintText={this.getTranslation('search_available_selected_items')}
                    defaultValue={this.state.filterText}
                    onChange={this._setFilterText}
                />
                {this.renderGroupEditor()}
                <div style={{ clear: 'both', height: '2rem', width: '100%' }} />
            </div>
        );
    },

    _orderChanged(newOrder) {
        const itemList = this.state.itemStore.getState();

        // TODO: Move the following mutation to an `Action`
        // Reset the ModelCollectionProperty / ModelCollection
        this.props.model[this.props.referenceProperty].clear();

        // Add the items back in the correct order
        newOrder.forEach((item) => {
            if (itemList.has(item)) {
                this.props.model[this.props.referenceProperty].add(itemList.get(item));
            }
        });

        // Set the state to the store to emit the value to all subscribers
        this.state.assignedItemStore.setState(this.props.model[this.props.referenceProperty].toArray().map(value => value.id));
    },

    _assignItems(items) {
        if (isOrganisationUnitLevelReference(this.props.referenceProperty, this.props.model.modelDefinition)) {
            const newList = Array.from((new Set((this.props.model[this.props.referenceProperty] || []).concat(items.map(Number)))).values());

            this.props.onChange({
                target: {
                    value: newList,
                },
            });
            this.state.assignedItemStore.setState(newList);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const modelsToAdd = filterModelsMapOnItemIds(this.state.itemStore.state, items);

            multiSelectActions.addItemsToModelCollection(modelsToAdd, this.props.referenceProperty, this.props.model)
                .subscribe(() => {
                    const newAssignedItems = []
                        .concat(this.state.assignedItemStore.getState())
                        .concat(items)
                        .filter(value => value);

                    this.state.assignedItemStore.setState(unique([].concat(newAssignedItems)));

                    this.props.onChange({
                        target: {
                            value: this.props.model[this.props.referenceProperty],
                        },
                    });

                    resolve();
                }, reject);
        });
    },

    _removeItems(items) {
        if (isOrganisationUnitLevelReference(this.props.referenceProperty, this.props.model.modelDefinition)) {
            const newList = Array.from((new Set((this.props.model[this.props.referenceProperty] || []).filter(v => items.map(Number).indexOf(v) === -1))).values());

            this.props.onChange({
                target: {
                    value: newList,
                },
            });
            this.state.assignedItemStore.setState(newList);
            return Promise.resolve();
        }

        return new Promise((resolve, reject) => {
            const modelsToRemove = filterModelsMapOnItemIds(this.state.itemStore.state, items);

            multiSelectActions.removeItemsFromModelCollection(modelsToRemove, this.props.referenceProperty, this.props.model)
                .subscribe(() => {
                    const newAssignedItems = []
                        .concat(this.state.assignedItemStore.getState())
                        .filter(item => items.indexOf(item) === -1)
                        .filter(value => value);

                    this.updateForm(newAssignedItems);
                    resolve();
                }, reject);
        });
    },

    _setFilterText(event) {
        this.setState({
            filterText: event.target.value,
        });
    },

    updateForm(newAssignedItems) {
        this.state.assignedItemStore.setState(unique([].concat(newAssignedItems)));

        this.props.onChange({
            target: {
                value: this.props.model[this.props.referenceProperty],
            },
        });
    },

    reloadAvailableItems() {
        this.setState({
            isRefreshing: true,
        });

        getInstance()
            .then(this.loadAvailableItems)
            .then(this.populateItemStore)
            .then(() => {
                this.setState({
                    isRefreshing: false,
                });
            });
    },

    checkCreateAuthority(d2) {
        const key = this.props.referenceType;
        if (d2.currentUser.canCreate(d2.models[key])) {
            this.setState({ canCreate: true });
        }
        return d2;
    },

    loadAvailableItems(d2) {
        if (d2.models[this.props.referenceType]) {
            const multiSelectSourceModelDefinition = d2.models[this.props.referenceType];

            // When there are any special filters set we need to apply them to the modelDefinition before loading
            // the items. An array of filters can be passed to the filter property of the options to the .list() call
            // As the default should always be filtered out we concat the set filters with default filter that filters
            // out anything with the name 'default'
            const filters = ['name:ne:default']
                .concat(this.props.queryParamFilter)
                .filter(f => f);

            return multiSelectSourceModelDefinition
                .list({ paging: false, fields: 'displayName|rename(name),id,level', filter: filters });
        }
        return Promise.reject(`${this.props.referenceType} is not a model on d2.models`);
    },

    populateItemStore(availableItems) {
        if (isOrganisationUnitLevelReference(this.props.referenceProperty, this.props.model.modelDefinition)) {
            this.state.itemStore.setState(Array.from(availableItems.values()).map(model => ({
                value: model.level,
                text: model.displayName || model.name,
            })));
            return;
        }

        this.state.itemStore.setState(availableItems);
    },

    populateAssignedStore() {
        if (!this.props.value) {
            return this.state.assignedItemStore.setState([]);
        }

        if (Array.isArray(this.props.value)) {
            this.state.assignedItemStore.setState(Array.from(this.props.value));
        } else {
            this.state.assignedItemStore.setState(Array.from(this.props.value.values()).map(value => value.id));
        }
    },
});
