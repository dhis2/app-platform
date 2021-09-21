import React, { PropTypes } from 'react';
import mapProps from 'recompose/mapProps';
import compose from 'recompose/compose';
import GroupEditor from 'd2-ui/lib/group-editor/GroupEditor.component';
import Paper from 'material-ui/Paper/Paper';
import mapPropsStream from 'recompose/mapPropsStream';
import { get, first, getOr, __ } from 'lodash/fp';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import withHandlers from 'recompose/withHandlers';
import Visibility from 'material-ui/svg-icons/action/visibility';
import VisibilityOff from 'material-ui/svg-icons/action/visibility-off';
import TextField from 'material-ui/TextField/TextField';
import pure from 'recompose/pure';
import withState from 'recompose/withState';
import Checkbox from 'material-ui/Checkbox/Checkbox';
import Store from 'd2-ui/lib/store/Store';
import {
    addDataElementsToStage,
    removeDataElementsFromStage,
    editProgramStageDataElement,
} from './actions';
import { Table } from './Table';

import programStore from '../eventProgramStore';
import { withRouter } from 'react-router';
import RenderTypeSelectField, { getRenderTypeOptions, DATA_ELEMENT_CLAZZ, MOBILE, DESKTOP } from '../render-types';

const getFirstProgramStage = compose(first, get('programStages'));

// Use programStage$ prop if present, else use first programStage
const programStage$ = props$ =>
    props$
        .take(1)
        .flatMap(
            props =>
                props.programStage$
                    ? props.programStage$
                    : programStore.map(getFirstProgramStage)
        );

const availableTrackerDataElements$ = programStore
    .map(get('availableDataElements'))
    .take(1);

const renderingOptions$ = programStore
    .map(get('renderingOptions'))
    .take(1);

const mapDispatchToProps = dispatch =>
    bindActionCreators(
        {
            addDataElementsToStage,
            removeDataElementsFromStage,
            editProgramStageDataElement,
        },
        dispatch
    );

const enhance = compose(
    withRouter,
    mapProps(props => ({
        ...props,
        groupName: props.match.params.groupName,
        modelType: props.schema,
        modelId: props.match.params.modelId,
    })),
    connect(null, mapDispatchToProps),
    mapPropsStream(props$ =>
        props$.combineLatest(
            programStage$(props$),
            availableTrackerDataElements$,
            renderingOptions$,
            (props, programStage, trackerDataElements, renderingOptions) => ({
                ...props,
                trackerDataElements,
                renderingOptions,
                model: programStage,
                items: programStage.programStageDataElements,
            })
        )
    ),
    withHandlers({
        onAssignItems: props => (dataElements) => {
            const { model, addDataElementsToStage } = props;
            addDataElementsToStage({ programStage: model.id, dataElements });
            return Promise.resolve();
        },
        onRemoveItems: ({
            model,
            removeDataElementsFromStage,
        }) => (dataElements) => {
            removeDataElementsFromStage({
                programStage: model.id,
                dataElements,
            });
            return Promise.resolve();
        },
        onEditProgramStageDataElement: ({
            model,
            editProgramStageDataElement,
        }) => programStageDataElement =>
            editProgramStageDataElement({
                programStage: model.id,
                programStageDataElement,
            }),
    }),
    withState('dataElementFilter', 'setDataElementFilter', '')
    // withProgramStageFromProgramStage$,
);

const flipBooleanPropertyOn = (object, key) => ({
    ...object,
    [key]: !object[key],
});

const ProgramStageDataElement = pure(
    ({ programStageDataElement, onEditProgramStageDataElement }) => {
        const isDateValue =
            programStageDataElement.dataElement.valueType === 'DATE';
        const onChangeFlipBooleanForProperty = propertyName => () =>
            onEditProgramStageDataElement(
                flipBooleanPropertyOn(programStageDataElement, propertyName),
            );
        const isCheckedForProp = getOr(false, __, programStageDataElement);

        return (
            <Table.Row>
                <Table.Cell
                    title={programStageDataElement.dataElement.displayName}
                    style={{
                        maxWidth: 250,
                        paddingLeft: 0,
                    }}
                >
                    {programStageDataElement.dataElement.displayName}
                </Table.Cell>
                <Table.Cell>
                    <Checkbox
                        checked={isCheckedForProp('compulsory')}
                        onClick={onChangeFlipBooleanForProperty('compulsory')}
                    />
                </Table.Cell>
                <Table.Cell>
                    <Checkbox
                        checked={isCheckedForProp('allowProvidedElsewhere')}
                        onClick={onChangeFlipBooleanForProperty(
                            'allowProvidedElsewhere'
                        )}
                    />
                </Table.Cell>
                <Table.Cell>
                    <Checkbox
                        checked={isCheckedForProp('displayInReports')}
                        checkedIcon={<Visibility />}
                        uncheckedIcon={<VisibilityOff />}
                        onClick={onChangeFlipBooleanForProperty(
                            'displayInReports'
                        )}
                    />
                </Table.Cell>
                <Table.Cell>
                    {isDateValue
                        ? <Checkbox
                            checked={isCheckedForProp('allowFutureDate')}
                            onClick={onChangeFlipBooleanForProperty(
                                'allowFutureDate',
                            )}
                        />
                        : null}
                </Table.Cell>
                <Table.Cell>
                        <Checkbox
                            checked={isCheckedForProp('skipSynchronization')}
                            onClick={onChangeFlipBooleanForProperty(
                                'skipSynchronization',
                            )}
                        />
                </Table.Cell>
                <Table.Cell>
                    <RenderTypeSelectField
                        device={MOBILE}
                        target={programStageDataElement}
                        options={programStageDataElement.dataElement.renderTypeOptions}
                        changeHandler={onEditProgramStageDataElement}
                    />
                </Table.Cell>
                <Table.Cell style={{ paddingRight: 0 }}>
                    <RenderTypeSelectField
                        device={DESKTOP}
                        target={programStageDataElement}
                        options={programStageDataElement.dataElement.renderTypeOptions}
                        changeHandler={onEditProgramStageDataElement}
                    />
                </Table.Cell>
            </Table.Row>
        );
    },
);

function addDisplayProperties(dataElements, renderingOptions) {
    return ({ dataElement, ...other }) => {
        const deDisplayProps = dataElements.find(
            ({ id }) => id === dataElement.id,
        );
        
        const renderTypeOptions = getRenderTypeOptions(dataElement, DATA_ELEMENT_CLAZZ, renderingOptions);
        if(!deDisplayProps) {
            console.warn("Could not find tracker-element with id", dataElement.id);
            //fallback to info that is already contained, and add renderType
            return {
                ...other,
                dataElement: {
                    ...dataElement,
                    renderTypeOptions,
                },
            };
        }
        const { displayName, valueType, optionSet } = deDisplayProps;

        return {
            ...other,
            dataElement: {
                ...dataElement,
                displayName,
                valueType,
                optionSet,
                renderTypeOptions,
            },
        };
    };
}

function AssignDataElements(props, { d2 }) {
    const itemStore = Store.create();
    const assignedItemStore = Store.create();
    const dataElementIds = new Set();

    const dataElements = props.trackerDataElements.map(dataElement => {
        dataElementIds.add(dataElement.id);
        return {
            id: dataElement.id,
            text: dataElement.displayName,
            value: dataElement.id,
        }
    })

    /* Fix for DHIS2-4369 where some program stages may contain other dataelements than TRACKER
    This is due to a database inconsistency. This fix makes it possible to show and be able to remove these
    elements from the UI.
    itemStore needs to be a superset of all assigned items, so we add the items that are assigned,
    but may not be in prop.trackerDataElements  */
    const otherElems = props.model.programStageDataElements
        .filter(({ dataElement }) => (
            dataElement.domainType !== "TRACKER" && !dataElementIds.has(dataElement.id)
        ))
        .map(({ dataElement }) => ({
            id: dataElement.id,
            text: dataElement.displayName,
            value: dataElement.id,
        }));   

    itemStore.setState(
        dataElements.concat(otherElems)
    );

    assignedItemStore.setState(
        props.model.programStageDataElements.map(v => v.dataElement.id)
    );

    const tableRows = props.model.programStageDataElements
        .map(addDisplayProperties(props.trackerDataElements, props.renderingOptions))
        .map((programStageDataElement, index) => {
            return (
                <ProgramStageDataElement
                    key={programStageDataElement.id}
                    programStageDataElement={programStageDataElement}
                    onEditProgramStageDataElement={
                        props.onEditProgramStageDataElement
                    }
                />
            );
        });

    return (
        <Paper>
            <div style={{ padding: '2rem 3rem 4rem', ...(props.outerDivStyle)}}>
                <TextField
                    hintText={d2.i18n.getTranslation(
                        'search_available_selected_items'
                    )}
                    onChange={compose(
                        props.setDataElementFilter,
                        getOr('', 'target.value')
                    )}
                    value={props.dataElementFilter}
                    fullWidth
                />
                <GroupEditor
                    itemStore={itemStore}
                    assignedItemStore={assignedItemStore}
                    height={250}
                    filterText={props.dataElementFilter}
                    onAssignItems={props.onAssignItems}
                    onRemoveItems={props.onRemoveItems}
                />
            </div>
            <Table style={{
                borderSpacing: 0,
            }}>
                <Table.Head>
                    <Table.Row>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('name')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('compulsory')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('allow_provided_elsewhere')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('display_in_reports')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('date_in_future')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('skip_synchronization')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('render_type_mobile')}
                        </Table.CellHead>
                        <Table.CellHead>
                            {d2.i18n.getTranslation('render_type_desktop')}
                        </Table.CellHead>
                    </Table.Row>
                </Table.Head>
                <Table.Body>
                    {tableRows}
                </Table.Body>
            </Table>
        </Paper>
    );
}

AssignDataElements.contextTypes = {
    d2: PropTypes.object,
    outerDivStyle: PropTypes.object
};

export default enhance(AssignDataElements);
