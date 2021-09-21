import React, { Component } from 'react';
import PropTypes from 'prop-types';

import GroupEditorWithOrdering from 'd2-ui/lib/group-editor/GroupEditorWithOrdering.component';
import Store from 'd2-ui/lib/store/Store';
import TextField from 'material-ui/TextField/TextField';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow } from 'material-ui/Table';
import TETAttributeRow from '../../../forms/form-fields/attribute-row';

const styles = {
    groupEditor: {
        padding: '2rem 0rem 4rem',
    },
    fieldname: {
        fontSize: 16,
        color: '#00000080',
    },
};

class AssignTrackedEntityTypeAttributes extends Component {
    state = {
        isLoading: true,
        availableAttributesStore: Store.create(),
        assignedAttributesStore: Store.create(),
        filterText: '',
        assignedAttributes: this.props.model.trackedEntityTypeAttributes || [],
    };

    componentDidMount() {
        this.context.d2.models.trackedEntityAttribute.list({
            level: 1,
            paging: false,
            fields: ['id,displayName,valueType,unique,optionSet,mandatory,searchable,displayInList'],
        }).then((trackedEntityAttributes) => {
            this.state.availableAttributesStore.setState(
                trackedEntityAttributes.toArray().map(attribute => ({
                    displayName: attribute.displayName,
                    text: attribute.displayName,
                    value: attribute.id,
                    valueType: attribute.valueType,
                    unique: attribute.unique,
                    optionSet: attribute.optionSet,
                    mandatory: attribute.mandatory,
                    searchable: attribute.searchable,
                    displayInList: attribute.displayInList,
                    trackedEntityAttribute: {
                        id: attribute.id,
                    },
                })),
            );
            this.state.assignedAttributesStore.setState(
                this.state.assignedAttributes.map(attribute => attribute.trackedEntityAttribute.id),
            );
            this.setState({ isLoading: false });
        });
    }

    onAssignAttributes = (assignedAttributesIds) => {
        const newAssignedAttributes = this.state.assignedAttributes
            .concat(this.getAttributeModels(assignedAttributesIds));
        const newAssignedAttributesIds = this.state.assignedAttributesStore.getState()
            .concat(assignedAttributesIds);

        this.updateState(newAssignedAttributes, newAssignedAttributesIds);
        return Promise.resolve();
    }

    onRemoveAttributes = (removedAttributesIds) => {
        const newAssignedAttributesIds = this.state.assignedAttributesStore.getState()
            .filter(assignedAttributeId => !removedAttributesIds.includes(assignedAttributeId));
        const newAssignedAttributes = this.state.assignedAttributes
            .filter(assignedAttribute => !removedAttributesIds.includes(assignedAttribute.trackedEntityAttribute.id));

        this.updateState(newAssignedAttributes, newAssignedAttributesIds);
        return Promise.resolve();
    }

    onEditAttribute = (changedAttribute) => {
        const newAssignedAttributes = this.state.assignedAttributes
            .map(attribute => ((attribute.trackedEntityAttribute.id === changedAttribute.trackedEntityAttribute.id)
                ? changedAttribute
                : attribute),
            );
        this.updateState(newAssignedAttributes);
    }

    onMoveAttributes = (newAttributesOrderIds) => {
        const newAssignedAttributes = newAttributesOrderIds.map(attributeId =>
            this.state.assignedAttributes.filter(attribute => attribute.trackedEntityAttribute.id === attributeId)[0]);

        this.updateState(newAssignedAttributes, newAttributesOrderIds);
    }

    getTranslation = value => this.context.d2.i18n.getTranslation(value);

    getAttributeModels = assignedAttributes =>
        this.state.availableAttributesStore.getState()
            .filter(attribute => assignedAttributes.includes(attribute.trackedEntityAttribute.id));

    getTableRows = () =>
        this.state.assignedAttributes
            .map(trackedEntityTypeAttribute => (
                <TETAttributeRow
                    columns={['displayInList', 'mandatory', 'searchable']}
                    key={trackedEntityTypeAttribute.trackedEntityAttribute.id}
                    displayName={trackedEntityTypeAttribute.displayName}
                    attribute={trackedEntityTypeAttribute}
                    onEditAttribute={this.onEditAttribute}
                    isDateValue={trackedEntityTypeAttribute.valueType === 'DATE'}
                    isUnique={trackedEntityTypeAttribute.unique}
                    hasOptionSet={!!trackedEntityTypeAttribute.optionSet}
                />
            ));

    setFilterText = (event) => {
        this.setState({ filterText: event.target.value });
    }

    updateState = (assignedAttributes, assignedAttributesIds) => {
        assignedAttributesIds && this.state.assignedAttributesStore.setState(assignedAttributesIds);
        this.updateAssignedState(assignedAttributes);
        this.signalChangeToParent(assignedAttributes);
    }

    updateAssignedState = (assignedAttributes) => {
        this.setState({ assignedAttributes });
    }

    signalChangeToParent = (assignedAttributes) => {
        this.props.onChange({
            target: {
                value: assignedAttributes,
            },
        });
    }

    render() {
        if (this.state.isLoading) {
            return null;
        }
        return (
            <div>
                <div style={styles.groupEditor}>
                    <div style={styles.fieldname}>{this.getTranslation('tracked_entity_type_attributes')}</div>
                    <TextField
                        hintText={this.getTranslation('search_available_tracked_entity_type_attributes')}
                        onChange={this.setFilterText}
                        value={this.state.filterText}
                        fullWidth
                    />
                    <GroupEditorWithOrdering
                        itemStore={this.state.availableAttributesStore}
                        assignedItemStore={this.state.assignedAttributesStore}
                        loading={this.state.isLoading}
                        height={250}
                        filterText={this.state.filterText}
                        onAssignItems={this.onAssignAttributes}
                        onRemoveItems={this.onRemoveAttributes}
                        onOrderChanged={this.onMoveAttributes}
                    />
                </div>
                <Table>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>{this.getTranslation('name')}</TableHeaderColumn>
                            <TableHeaderColumn>{this.getTranslation('display_in_list')}</TableHeaderColumn>
                            <TableHeaderColumn>{this.getTranslation('mandatory')}</TableHeaderColumn>
                            <TableHeaderColumn>{this.getTranslation('searchable')}</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {this.getTableRows()}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

AssignTrackedEntityTypeAttributes.propTypes = {
    model: PropTypes.shape({
        trackedEntityTypeAttributes: PropTypes.array,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
};

AssignTrackedEntityTypeAttributes.contextTypes = {
    d2: PropTypes.object,
};

export default AssignTrackedEntityTypeAttributes;
