import React, { Component, PropTypes } from 'react';

import { uniq, get, range } from 'lodash/fp';

import { getInstance } from 'd2/lib/d2';
import { generateUid } from 'd2/lib/uid';
import GroupEditor from 'd2-ui/lib/group-editor/GroupEditor.component';
import Store from 'd2-ui/lib/store/Store';
import Row from 'd2-ui/lib/layout/Row.component';

import TextField from 'material-ui/TextField/TextField';
import LinearProgress from 'material-ui/LinearProgress/LinearProgress';

import { Observable } from 'rxjs';
import log from 'loglevel';
import componentFromStream from 'recompose/componentFromStream';

import DataSetElementCategoryComboSelectionDialog from './DataSetElementCategoryComboSelectionDialog.component';

function getCategoryComboNameForDataElement(dses, de) {
    const dataSetElementForDataElement = Array
        .from(dses || [])
        .find(dse => dse.dataElement && dse.dataElement.id === de.id);

    if (dataSetElementForDataElement && dataSetElementForDataElement.categoryCombo && dataSetElementForDataElement.categoryCombo.id !== de.categoryCombo.id) {
        return dataSetElementForDataElement.categoryCombo.displayName;
    }
}

function getDataElementNameForGroupEditor(dataSetElements, dataElement) {
    const categoryComboName = getCategoryComboNameForDataElement(dataSetElements, dataElement);

    if (categoryComboName) {
        return `${dataElement.displayName} (${categoryComboName})`;
    }

    return dataElement.displayName;
}

const styles = {
    fieldWrap: {
        marginBottom: '5rem',
        marginTop: '3rem',
    },

    label: {
        position: 'relative',
        display: 'block',
        width: 'calc(100% - 60px)',
        lineHeight: '24px',
        color: 'rgba(0,0,0,0.5)',
        marginTop: '1rem',
        fontSize: 16,
        fontWeight: 500,
    },
};

class DataSetElementField extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            itemStore: Store.create(),
            assignedItemStore: Store.create(),
            filterText: '',
        };
        
        // TODO: Should update this with the assigned category combo name
        this.state.itemStore.setState(
            props.dataElements
                .map(dataElement => ({
                    text: getDataElementNameForGroupEditor(props.dataSet.dataSetElements, dataElement),
                    value: dataElement.id,
                }))
        );
        this.state.assignedItemStore.setState(
            Array.from(props.dataSet.dataSetElements || [])
                .filter(dse => dse.dataElement)
                .sort((left, right) => ((left.dataElement && left.dataElement.displayName || '').localeCompare(right.dataElement && right.dataElement.displayName)))
                .map(dse => dse.dataElement.id),
        );
    }

    componentDidMount() {
        this.props.loadMetaData();
    }

    componentWillReceiveProps(props) {
        this.state.itemStore.setState(
            props.dataElements
                .map(dataElement => ({
                    text: getDataElementNameForGroupEditor(props.dataSet.dataSetElements, dataElement),
                    value: dataElement.id,
                }))
        );

        this.state.assignedItemStore.setState(
            Array.from(props.dataSet.dataSetElements || [])
                .filter(dse => dse.dataElement)
                .sort((left, right) => ((left.dataElement && left.dataElement.displayName || '').localeCompare(right.dataElement && right.dataElement.displayName)))
                .map(dse => dse.dataElement.id)
        );
    }

    setFilterText = (event, value) => {
        this.setState({
            filterText: value,
        });
    }

    _assignItems = (items) => {
        const updateGroupEditorState = () => {
            const uniqueItems = new Set(this.state.assignedItemStore.getState().concat(items));

            this.state.assignedItemStore.setState(Array.from(uniqueItems));

            this.updateForm(Array.from(uniqueItems));
        };

        const generateUids = numberofUids => range(0, numberofUids, 1).map(() => generateUid());
        const codes = generateUids(items.length);

        items
            .map(dataElementId => this.props.dataElements.find(dataElement => dataElement.id === dataElementId))
            .filter(de => de)
            .forEach((dataElement, index) => {
                const dataSetElement = {
                    id: codes[index],
                    dataElement,
                    dataSet: {
                        id: this.props.dataSet.id,
                    },
                };

                this.props.dataSet.dataSetElements = [].concat(this.props.dataSet.dataSetElements || []).concat([dataSetElement]);
            });

        updateGroupEditorState();

        return Promise.resolve();
    }

    _removeItems = (items) => {
        const updateGroupEditorStore = () => {
            const uniqueItems = new Set(this.state.assignedItemStore.getState());

            items.forEach(item => uniqueItems.delete(item));

            this.state.assignedItemStore.setState(Array.from(uniqueItems));

            this.updateForm(Array.from(uniqueItems));
        };

        return Promise.resolve(true)
            .then(() => {
                const dataSetElementsThatAreNotInItemsToRemove = (itemsToRemove = []) => ({ dataElement = {} }) => get('id', dataElement) && !itemsToRemove.includes(get('id', dataElement));

                // Remove the items from the modelCollection
                this.props.dataSet.dataSetElements = Array.from(this.props.dataSet.dataSetElements)
                    // Only keep dataSetElements that do not exist in the `items` collection
                    .filter(dataSetElementsThatAreNotInItemsToRemove(items));
            })
            .then(updateGroupEditorStore)
            .catch(e => log.error(e));
    }

    _updateCategoryComboForDataSetElement = (selectedDataSetElement, categoryCombo) => {
        const dataSetElements = this.props.dataSet.dataSetElements;

        if (dataSetElements.some(dataSetElement => dataSetElement === selectedDataSetElement)) {
            const dataSetElement = dataSetElements.find(dataSetElement => dataSetElement === selectedDataSetElement);

            dataSetElement.categoryCombo = categoryCombo;

            this.props.onChange({
                target: {
                    value: dataSetElements,
                },
            });
        }
    }

    updateForm = (newAssignedItems) => {
        this.state.assignedItemStore.setState(uniq([].concat(newAssignedItems)));

        this.props.onChange({
            target: {
                value: this.props.dataSet.dataSetElements,
            },
        });
    }

    render() {
        const {
            categoryCombos,
            dataSet,
        } = this.props;

        return (
            <div style={styles.fieldWrap}>
                <label style={styles.label}>{this.props.labelText}</label>
                <Row flexValue="0 0 auto" style={{ justifyContent: 'space-between' }}>
                    <TextField
                        value={this.state.filterText}
                        onChange={this.setFilterText}
                        fullWidth
                        hintText={this.context.d2.i18n.getTranslation('search_available_selected_items')}
                    />
                    <DataSetElementCategoryComboSelectionDialog
                        dataSetElements={dataSet.dataSetElements}
                        categoryCombos={categoryCombos}
                        onCategoryComboSelected={this._updateCategoryComboForDataSetElement}
                    />
                </Row>
                <GroupEditor
                    itemStore={this.state.itemStore}
                    assignedItemStore={this.state.assignedItemStore}
                    onAssignItems={this._assignItems}
                    onRemoveItems={this._removeItems}
                    height={250}
                    filterText={this.state.filterText}
                />
            </div>
        );
    }
}
DataSetElementField.contextTypes = {
    d2: PropTypes.object,
};

// metadata.json?dataElements:fields=id,displayName&dataElements:filter=domainType:eq:AGGREGATE&categoryCombos:fields=id,displayName
async function dataSetElementFieldData() {
    const d2 = await getInstance();
    const api = d2.Api.getApi();

    const { system, ...metadata } = await api.get('metadata', {
        'dataElements:fields': 'id,displayName,categoryCombo[id]',
        'dataElements:filter': 'domainType:eq:AGGREGATE',
        'categoryCombos:fields': 'id,displayName',
        'categoryCombos:filter': 'dataDimensionType:eq:DISAGGREGATION',
    });

    return {
        ...metadata,
    };
}

const metadata$ = Store.create();
const loadMetaDataForDataSetElementField = () => dataSetElementFieldData().then(metadata => metadata$.setState(metadata));

const enhancedDataElementField$ = props$ => Observable
    .combineLatest(
        props$,
        metadata$
            .startWith({ dataElements: [], categoryCombos: [] }),
        (props, metadata) => ({
            ...metadata,
            ...props,
        })
    )
    .map(({ model, dataElements, categoryCombos, ...props }) => (
        <DataSetElementField
            {...props}
            dataSet={model}
            dataElements={dataElements}
            categoryCombos={categoryCombos}
            onChange={props.onChange}
            loadMetaData={loadMetaDataForDataSetElementField}
        />
    ))
    .startWith(<LinearProgress />);

export default componentFromStream(enhancedDataElementField$);
