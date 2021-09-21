import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Observable } from 'rxjs';

import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';

import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import RaisedButton from 'material-ui/RaisedButton/RaisedButton';

import Pagination from 'd2-ui/lib/pagination/Pagination.component';
import LinearProgress from 'material-ui/LinearProgress/LinearProgress';
import AlertIcon from 'material-ui/svg-icons/alert/warning';
import TranslationDialog from 'd2-ui/lib/i18n/TranslationDialog.component';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';

import OptionSorter from './OptionSorter/OptionSorter.component';
import OptionDialogForOptions from './OptionDialogForOptions/OptionDialogForOptions.component';

import { calculatePageValue } from '../../List/helpers/pagination'; // TODO: Move this out to some other file.

import snackActions from '../../Snackbar/snack.actions';
import actions from './actions';
import modelToEditStore from '../modelToEditStore';
import { optionsForOptionSetStore } from './stores';

const styles = {
    optionManagementWrap: {
        display: 'flex',
        flexDirection: 'column',
        padding: '1rem 1rem 1rem 1rem',
    },
    dataTableWrap: {
        position: 'relative',
    },
    sortBarStyle: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingBottom: '1rem',
        paddingLeft: '1rem',
    },
    sortButtonStyle: {
        flex: '0 0 15rem',
        marginLeft: '1rem',
    },
    alertWrapper: {
        color: 'orange',
        display: 'flex',
        padding: '0.5rem',
        border: '1px dotted orange',
        borderRadius: '0.5rem',
        marginTop: '2rem',
    },
    alertText: {
        lineHeight: '2rem',
        paddingLeft: '1rem',
    },
    addButton: {
        float: 'right',
    },
};

class OptionManagement extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            nameSortedASC: false,
            isSorting: false,
            modelToTranslate: null,
            modelToShare: null,
        };

        this.i18n = context.d2.i18n;
    }

    componentDidMount() {
        this.subscription = actions
            .getOptionsFor(this.props.model)
            .subscribe(() => this.forceUpdate());
    }

    componentWillReceiveProps(newProps) {
        if (this.props.model !== newProps.model) {
            actions.getOptionsFor(newProps.model);
        }
    }

    componentWillUnmount() {
        if (this.subscription && this.subscription.unsubscribe) {
            this.subscription.unsubscribe();
        }
    }

    onAddOption = () => actions.setActiveModel();

    onAddDialogClose = () => actions.closeOptionDialog();

    onEditOption = model => actions.setActiveModel(model);

    translationSaved = () => snackActions.show({
        message: 'translation_saved',
        translate: true,
    });

    translationErrored = () => snackActions.show({
        message: 'translation_save_error',
        action: 'ok',
        translate: true,
    });

    displayInCorrectOrderWarning() {
        if (!(this.props.pager && this.props.pager.total > 50)) {
            return null;
        }

        return (
            <div style={styles.alertWrapper}>
                <AlertIcon color="orange" />
                <div style={styles.alertText}>
                    {this.i18n.getTranslation('list_might_not_represent_the_accurate_order_of_options_due_the_availability_of_pagination')}
                </div>
            </div>
        );
    }

    isContextActionAllowed = (model, action) => {
        if (!model || !model.access) {
            return false;
        }
        if (model.access.hasOwnProperty(action)) {
            return model.access[action];
        }
        switch (action) {
            case 'edit':
                return model.access.write;
            case 'share':
                return model.modelDefinition.isShareable === true && model.access.write;
            default:
                return true;
        }
    }
    renderPagination() {
        if (!this.props.pager) {
            return null;
        }

        const paginationProps = {
            hasNextPage: () => Boolean(this.props.pager.hasNextPage) && this.props.pager.hasNextPage(),
            hasPreviousPage: () => Boolean(this.props.pager.hasPreviousPage) && this.props.pager.hasPreviousPage(),
            onNextPageClick: () => {
                this.setState({ isLoading: true });
                this.props.getNextPage();
            },
            onPreviousPageClick: () => {
                this.setState({ isLoading: true });
                this.props.getPreviousPage();
            },
            total: this.props.pager.total,
            currentlyShown: calculatePageValue(this.props.pager),
        };

        return <Pagination {...paginationProps} />;
    }

    renderSharingDialog = () => (
        <SharingDialog
            d2={this.context.d2}
            id={this.state.modelToShare.id}
            type={'option'}
            open={!!this.state.modelToShare}
            onRequestClose={() => this.setState({modelToShare: null})}
            bodyStyle={{ minHeight: '400px' }}
        />
    )

    render() {
        const contextActions = {
            edit: this.onEditOption,
            share: (modelToShare) => {
                this.setState({
                    modelToShare
                })
            },
            delete: modelToDelete => actions.deleteOption(modelToDelete, this.props.model),
            translate: (modelToTranslate) => {
                this.setState({
                    modelToTranslate,
                });
            },
        };

        return (
            <div style={styles.optionManagementWrap}>
                {this.displayInCorrectOrderWarning()}
                {this.renderPagination()}
                <OptionSorter
                    style={styles.sortBarStyle}
                    buttonStyle={styles.sortButtonStyle}
                    rows={this.props.rows}
                />
                <div style={styles.dataTableWrap}>
                    {this.props.isLoading && <LinearProgress />}
                    <DataTable
                        rows={this.props.rows}
                        columns={this.props.columns}
                        primaryAction={this.onEditOption}
                        contextMenuActions={contextActions}
                        isContextActionAllowed={this.isContextActionAllowed}
                    />
                </div>
                <OptionDialogForOptions
                    onRequestClose={this.onAddDialogClose}
                    parentModel={this.props.model}
                />
                {this.state.modelToTranslate && <TranslationDialog
                    objectToTranslate={this.state.modelToTranslate}
                    objectTypeToTranslate={
                        this.state.modelToTranslate &&
                        this.state.modelToTranslate.modelDefinition}
                    open={Boolean(this.state.modelToTranslate)}
                    onTranslationSaved={this.translationSaved}
                    onTranslationError={this.translationErrored}
                    onRequestClose={() => this.setState({ modelToTranslate: null })}
                    fieldsToTranslate={['name']}
                />}
                {this.state.modelToShare && this.renderSharingDialog()}
                <div>
                    <RaisedButton
                        label={this.i18n.getTranslation('add_option')}
                        primary
                        onClick={this.onAddOption}
                        style={styles.addButton}
                    />
                </div>
            </div>
        );
    }
}

OptionManagement.propTypes = {
    model: PropTypes.object,
    rows: PropTypes.array,
    columns: PropTypes.array,
    optionDialogOpen: PropTypes.bool,
    isLoading: PropTypes.bool,
    getNextPage: PropTypes.func,
    getPreviousPage: PropTypes.func,
    pager: PropTypes.object,
};

OptionManagement.defaultProps = {
    getNextPage: () => {},
    getPreviousPage: () => {},
    model: {},
    pager: {},
    rows: [],
    columns: ['name', 'code'],
    optionDialogOpen: false,
    isLoading: false,
};

OptionManagement.contextTypes = { d2: PropTypes.object };

const optionList$ = Observable.combineLatest(
    optionsForOptionSetStore,
    Observable.of(['name', 'code']),
    ({ options, pager, ...other }, columns) => ({
        ...other,
        rows: options,
        pager,
        columns,
    }),
);

const stateForOptionManagement$ = Observable
    .combineLatest(modelToEditStore, optionList$, (modelToEdit, optionList) => (
        {
            ...optionList,
            model: modelToEdit,
        }
    ));

export default withStateFrom(stateForOptionManagement$, OptionManagement);
