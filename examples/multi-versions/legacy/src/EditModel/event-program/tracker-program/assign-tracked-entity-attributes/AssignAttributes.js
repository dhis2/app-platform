import React from 'react';
import PropTypes from 'prop-types';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get, has } from 'lodash/fp';

import withProps from 'recompose/withProps';
import compose from 'recompose/compose';
import mapPropsStream from 'recompose/mapPropsStream';
import withState from 'recompose/withState';
import withHandlers from 'recompose/withHandlers';
import lifecycle from 'recompose/lifecycle';
import GroupEditorWithOrdering from 'd2-ui/lib/group-editor/GroupEditorWithOrdering.component';
import Store from 'd2-ui/lib/store/Store';

import Paper from 'material-ui/Paper/Paper';
import TextField from 'material-ui/TextField/TextField';
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
} from 'material-ui/Table';

import ProgramAttributeRow from '../../../../forms/form-fields/attribute-row';
import eventProgramStore from '../../eventProgramStore';
import {
    addAttributesToProgram,
    removeAttributesFromProgram,
    editProgramAttributes,
    setAttributesOrder
} from './actions';
import { 
    getRenderTypeOptions,
    TRACKED_ENTITY_ATTRIBUTE_CLAZZ,
} from '../../render-types';

const styles = {
    groupEditor: {
        padding: '2rem 3rem 4rem',
        marginTop: '15px'
    },
    fieldname: {
        fontSize: 16,
        color: '#00000080',
    },
};

const program$ = eventProgramStore.map(get('program'));

const availableAttributes$ = eventProgramStore
    .map(get('availableAttributes'))
    .take(1);

const renderingOptions$ = eventProgramStore
    .map(get('renderingOptions'))
    .take(1);

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            addAttributesToProgram,
            removeAttributesFromProgram,
            editProgramAttributes,
            setAttributesOrder
        },
        dispatch
    );

/**
 * Extracts attributes that are in TrackedEntityTypeAttributes, but not in
 * programTrackedEntityAttributes
 * @param programModel Program model to use for programTrackedEntityAttributes
 * @returns {Array} An array of TrackedEntityAttributes that are in tetAttributes, but
 * not in programTrackedEntityAttributes, or empty if none.
 */
export function tetAttributesNotInProgram(programModel) {
    if (
        programModel &&
        has('trackedEntityType.trackedEntityTypeAttributes', programModel)
    ) {
        return programModel.trackedEntityType.trackedEntityTypeAttributes.filter(
            teta => {
                const hasAttribute = programModel.programTrackedEntityAttributes.find(
                    ptea =>
                        ptea.trackedEntityAttribute.id ===
                        teta.trackedEntityAttribute.id
                );
                return !hasAttribute;
            }
        );
    }
    return [];
}
export const withAttributes = mapPropsStream(props$ =>
    props$.combineLatest(
        program$,
        availableAttributes$,
        renderingOptions$,
        (props, program, availableAttributes, renderingOptions) => ({
            ...props,
            availableAttributes,
            renderingOptions,
            model: program,
            assignedAttributes: program.programTrackedEntityAttributes.map(addDisplayProperties(availableAttributes, renderingOptions)),
        })
    )
);

const enhance = compose(
    withProps(props => ({
        groupName: props.params.groupName,
        modelType: props.schema,
        modelId: props.params.modelId,
    })),
    connect(null, mapDispatchToProps),
    lifecycle({
        componentDidMount() {
            if (this.props.modelId === 'add') {
                // When creating a new program we add the TET's attributes to the programTrackedEntityAttributes
                // since this is most likely what is needed. On edit, we don't do this because:
                // a) the UI will not reflect the reality, for example if a TET has new attributes these won't be present 
                //    in the program's programTrackedEntityAttributes. In the UI it would look as if they were added already.
                // b) the program might have manualy removed one of the TET's attributes and now that attribute could be
                //    added again accidentally when clicking save
                const attributes = tetAttributesNotInProgram(this.props.model).map(
                    a => a.trackedEntityAttribute.id
                );
                this.props.addAttributesToProgram({ attributes });
            }
        },
    }),
    withState('attributeFilter', 'setAttributeFilter', ''),
    withHandlers({
        onAssignItems: ({ addAttributesToProgram }) => attributes => {
            addAttributesToProgram({ attributes });
            return Promise.resolve();
        },
        onRemoveItems: ({ removeAttributesFromProgram }) => attributes => {
            removeAttributesFromProgram({ attributes });
            return Promise.resolve();
        },
        onEditProgramAttribute: ({ editProgramAttributes }) => attribute =>
            editProgramAttributes({
                attribute,
            }),
        onAttributeFilter: ({ setAttributeFilter }) => e =>
            setAttributeFilter(e.target.value),
    })
);

function addDisplayProperties(attributes, renderingOptions) {
    return (assignedAttribute) => {
        const { trackedEntityAttribute, ...other } = assignedAttribute;
        const { displayName, valueType, optionSet, unique } = attributes.find(
            ({ id }) => id === trackedEntityAttribute.id
        );
        
        const renderTypeOptions = getRenderTypeOptions(trackedEntityAttribute, TRACKED_ENTITY_ATTRIBUTE_CLAZZ, renderingOptions);
        return {
            ...other,
            trackedEntityAttribute: {
                ...trackedEntityAttribute,
                displayName,
                valueType,
                optionSet,
                unique,
                renderTypeOptions,
            },
        };
    };
}

function AssignAttributes(props, { d2 }) {
    const availableItemStore = Store.create();
    const assignedItemStore = Store.create();

    availableItemStore.setState(
        props.availableAttributes.map(attribute => ({
            id: attribute.id,
            text: attribute.displayName,
            value: attribute.id,
        }))
    );

    // Assign existing attributes
    assignedItemStore.setState(
        props.assignedAttributes.map(a => a.trackedEntityAttribute.id)
    );

    const onMoveAttributes = newAttributesOrderIds => {
        assignedItemStore.setState(newAttributesOrderIds);
        props.setAttributesOrder(newAttributesOrderIds);
    };

    // Create edit-able rows for assigned attributes
    const tableRows = props.assignedAttributes
        .map(addDisplayProperties(props.availableAttributes, props.renderingOptions))
        .map(programAttribute =>
            <ProgramAttributeRow
                key={programAttribute.id}
                displayName={
                    programAttribute.trackedEntityAttribute.displayName
                }
                attribute={programAttribute}
                onEditAttribute={props.onEditProgramAttribute}
                isDateValue={
                    programAttribute.trackedEntityAttribute.valueType === 'DATE'
                }
                isUnique={programAttribute.trackedEntityAttribute.unique}
                hasOptionSet={
                    !!programAttribute.trackedEntityAttribute.optionSet
                }
                renderTypeOptions={
                    programAttribute.trackedEntityAttribute.renderTypeOptions    
                }
            />
        );

    return (
        <Paper>
            <div style={styles.groupEditor}>
                <div style={styles.fieldname}>
                    {d2.i18n.getTranslation(
                        'program_tracked_entity_attributes'
                    )}
                </div>
                <TextField
                    hintText={d2.i18n.getTranslation(
                        'search_available_program_tracked_entity_attributes'
                    )}
                    onChange={props.onAttributeFilter}
                    value={props.attributeFilter}
                    fullWidth
                />
                <GroupEditorWithOrdering
                    itemStore={availableItemStore}
                    assignedItemStore={assignedItemStore}
                    height={250}
                    filterText={props.attributeFilter}
                    onAssignItems={props.onAssignItems}
                    onRemoveItems={props.onRemoveItems}
                    onOrderChanged={onMoveAttributes}
                />
            </div>
            <Table>
                <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                    <TableRow>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('name')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('display_in_list')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('mandatory')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('date_in_future')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('searchable')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('render_type_mobile')}
                        </TableHeaderColumn>
                        <TableHeaderColumn>
                            {d2.i18n.getTranslation('render_type_desktop')}
                        </TableHeaderColumn>
                    </TableRow>
                </TableHeader>
                <TableBody displayRowCheckbox={false}>
                    {tableRows}
                </TableBody>
            </Table>
        </Paper>
    );
}

AssignAttributes.propTypes = {
    availableAttributes: PropTypes.array.isRequired,
    assignedAttributes: PropTypes.array.isRequired,
    onEditProgramAttribute: PropTypes.func.isRequired,
    attributeFilter: PropTypes.string.isRequired,
    onAttributeFilter: PropTypes.func.isRequired,
    onAssignItems: PropTypes.func.isRequired,
    onRemoveItems: PropTypes.func.isRequired,
};

AssignAttributes.contextTypes = {
    d2: PropTypes.object,
};

export default enhance(AssignAttributes);
