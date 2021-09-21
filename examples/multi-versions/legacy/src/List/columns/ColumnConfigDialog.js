import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Dialog from 'material-ui/Dialog/Dialog';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {
    closeColumnsDialog,
    loadColumnsForModel,
    setColumnsForModel,
} from './actions';
import { getColumnsForModelType, getDialogOpen } from './selectors';
import { getTableColumnsForType } from '../../config/maintenance-models';
import { arrayMove } from 'react-sortable-hoc';
import Divider from 'material-ui/Divider';
import SortableColumnsList from './SortableColumns';
import camelCaseToUnderScores from 'd2-utilizr/lib/camelCaseToUnderscores';
import FlatButton from 'material-ui/FlatButton';
import AvailableColumnsList from './AvailableColumnsList';

export class ColumnConfigDialog extends Component {
    constructor(props, context) {
        super(props, context);
        this.t = context.d2.i18n.getTranslation.bind(context.d2.i18n);

        this.state = {
            ...this.getUpdatedColumnState(),
            error: null,
        };
    }

    componentWillReceiveProps(newProps) {
        if (this.props.modelType !== newProps.modelType) {
            const newState = this.getUpdatedColumnState(newProps);
            this.setState({ ...newState });
        }
    }

    getUpdatedColumnState = (props = this.props) => {
        const userSelectedColumns = props.userSelectedColumns;
        const defaultColumns = getTableColumnsForType(
            props.modelType,
            true,
            true
        ).map(this.withDisplayProps);

        const availableColumns = getAvailableColumnsForModel(
            this.context.d2.models[props.modelType]
        )
            .map(this.withDisplayProps)
            .concat(defaultColumns)
            .filter(
                (val, ind, self) =>
                    ind === self.findIndex(v => v.value === val.value) //remove duplicates
            )
            .sort((a, b) => a.displayValue.localeCompare(b.displayValue));

        //use default if columns are not specified by user
        const selectedColumns =
            userSelectedColumns.length < 1
                ? defaultColumns
                : userSelectedColumns.map(this.withDisplayProps);

        return {
            defaultColumns: defaultColumns,
            selectedColumns: selectedColumns,
            availableColumns,
        };
    };

    withDisplayProps = value => ({
        value: value,
        displayValue: this.t(
            camelCaseToUnderScores(value.replace(/(\w*)\[(\w*)]/, '$1___$2'))
        ),
    });

    handleAddColumn = column => {
        this.setState({
            selectedColumns: this.state.selectedColumns.concat(column),
            error: null,
        });
    };

    handleOnSortEnd = ({ oldIndex, newIndex }) => {
        this.setState({
            selectedColumns: arrayMove(
                this.state.selectedColumns,
                oldIndex,
                newIndex
            ),
        });
    };

    handleResetToDefault = () => {
        this.setState({
            selectedColumns: this.state.default,
            error: null,
        });
    };

    handleSaveOrder = () => {
        this.setState({ error: null });
        if (this.state.selectedColumns === this.state.defaultColumns) {
            this.props.setColumnsForModel(this.props.modelType, []);
            return;
        }
        const selectedColumns = this.state.selectedColumns.map(
            col => col.value
        );
        this.props.setColumnsForModel(this.props.modelType, selectedColumns);
    };

    handleRemoveItem = (index, modelType) => {
        const selected = this.state.selectedColumns;
        if (selected.length < 2) {
            return this.setState({
                error: 'Must have at least one column selected.',
            });
        }

        const newSelected = [
            ...selected.slice(0, index),
            ...selected.slice(index + 1),
        ];

        this.setState(state => ({
            selectedColumns: newSelected,
        }));
    };

    handleResetToDefault = () => {
        this.setState(state => ({ selectedColumns: state.defaultColumns }));
    };

    render() {
        const actions = [
            <FlatButton
                label={this.t('cancel')}
                primary={true}
                onClick={this.props.closeColumnsDialog}
            />,
            <FlatButton
                label={this.t('save')}
                primary={true}
                onClick={this.handleSaveOrder}
            />,
        ];

        return (
            <Dialog
                open={this.props.open}
                onRequestClose={this.props.closeColumnsDialog}
                actions={actions}
                autoScrollBodyContent
                title={this.t('manage_columns')}
            >
                <h3>{this.t('selected_columns')}</h3>
                <SortableColumnsList
                    items={this.state.selectedColumns}
                    onSortEnd={this.handleOnSortEnd}
                    onRemoveItem={this.handleRemoveItem}
                />
                <FlatButton
                    label={this.t('reset_to_default')}
                    onClick={this.handleResetToDefault}
                    secondary
                    disabled={
                        this.state.selectedColumns === this.state.defaultColumns
                    }
                />
                {this.state.error}
                <Divider />
                <h3>{this.t('available_columns')}</h3>
                <AvailableColumnsList
                    columns={this.state.availableColumns}
                    onClick={this.handleAddColumn}
                    selectedColumns={this.state.selectedColumns}
                />
            </Dialog>
        );
    }
}

/**
 * Gets the columns that should be shown for the model
 * We try to show most "simple" columns, ie bools, text, etc.
 * Ignore some that are internal, no easy way to filter these without a blacklist
 *
 */
function getAvailableColumnsForModel(model) {
    const validations = model.modelValidations;
    const ignoreFieldTypes = new Set(['COLLECTION', 'REFERENCE', 'COMPLEX']);
    const ignoreFieldNames = new Set([
        'dimensionItem',
        'dimensionItemType',
        'dimension',
        'allItems',
        'optionSetValue',
        'ignoreApproval',
        'leaf',
        'memberCount',
        'path',
        'registration',
        'fieldMask',
        'orgunitScope',
        'programScope',
        'sortOrderInListNoProgram',
        'sortOrderInVisitSchedule',
        'displayOnVisitSchedule'
    ]);
    // These should have translated fields from the server, ie displayName.
    // In some cases the translated property does not exist on the model, and we should probably show
    // the original ones instead, for now just ignore these.
    const translatedValues = new Set([
        'name',
        'description',
        'shortName',
        'formName',
    ]);
    let availableColumns = ['user[name]', 'lastUpdatedBy[name]'];

    for (let fieldName in validations) {
        let field = validations[fieldName];
        if (
            !ignoreFieldTypes.has(field.type) &&
            !ignoreFieldNames.has(fieldName) &&
            !translatedValues.has(fieldName)
        ) {
            availableColumns.push(fieldName);
        }
    }

    return availableColumns;
}

ColumnConfigDialog.contextTypes = {
    d2: PropTypes.object,
};

ColumnConfigDialog.propTypes = {
    open: PropTypes.bool,
    columns: PropTypes.array,
    modelType: PropTypes.string,
    loadColumnsForModel: PropTypes.func,
    closeColumnsDialog: PropTypes.func,
    setColumnsForModel: PropTypes.func,
};

const mapStateToProps = (state, ownProps) => ({
    userSelectedColumns: getColumnsForModelType(state, ownProps.modelType),
});

const mapDispatchToProps = dispatch => ({
    ...bindActionCreators(
        {
            closeColumnsDialog,
            setColumnsForModel,
        },
        dispatch
    ),
    loadColumnsForModel(modelType) {
        dispatch(loadColumnsForModel(modelType));
    },
});

const ColumnConfigDialogConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(ColumnConfigDialog);

export default ColumnConfigDialogConnected;
