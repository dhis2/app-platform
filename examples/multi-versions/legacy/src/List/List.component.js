import React, { Component } from 'react';
import PropTypes from 'prop-types';

import log from 'loglevel';

import isIterable from 'd2-utilizr/lib/isIterable';
import DataTable from 'd2-ui/lib/data-table/DataTable.component';
import Pagination from 'd2-ui/lib/pagination/Pagination.component';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import SharingDialog from '@dhis2/d2-ui-sharing-dialog';
import TranslationDialog from 'd2-ui/lib/i18n/TranslationDialog.component';
import Heading from 'd2-ui/lib/headings/Heading.component';

import DetailsBoxWithScroll from './DetailsBoxWithScroll.component';
import contextActions from './ContextActions';
import detailsStore from './details.store';
import listStore from './list.store';
import listActions from './list.actions';
import ListActionBar from './ListActionBar.component';
import SearchBox from './SearchBox.component';
import LoadingStatus from './LoadingStatus.component';
import sharingStore from './sharing.store';
import translationStore from './translation-dialog/translationStore';
import dataElementOperandStore from './compulsory-data-elements-dialog/compulsoryDataElementStore';
import predictorDialogStore from './predictor-dialog/predictorDialogStore';
import PredictorDialog from './predictor-dialog/PredictorDialog.component';
import snackActions from '../Snackbar/snack.actions';
import fieldOrder from '../config/field-config/field-order';
import { calculatePageValue } from './helpers/pagination';
import HelpLink from './HelpLink.component';
import Dropdown from '../forms/form-fields/drop-down';
import DropdownAsync from '../forms/form-fields/drop-down-async';
import { getFilterFieldsForType } from '../config/maintenance-models';
import { withAuth } from '../utils/Auth';
import CompulsoryDataElementOperandDialog from './compulsory-data-elements-dialog/CompulsoryDataElementOperandDialog.component';
import './listValueRenderers';
import IconButton from 'material-ui/IconButton/IconButton';
import FontIcon from 'material-ui/FontIcon/FontIcon';
import { connect } from 'react-redux';
import { openColumnsDialog } from './columns/actions';
import DialogRouter from '../Dialog/DialogRouter';
import ContextMenuHeader from './ContextMenuHeader'
import { openDialog } from '../Dialog/actions';
import * as DIALOGTYPES from '../Dialog/types';

const styles = {
    dataTableWrap: {
        display: 'flex',
        flexDirection: 'column',
        flex: 2,
    },
    detailsBoxWrap: {
        flex: 1,
        marginLeft: '1rem',
        marginRight: '1rem',
        opacity: 1,
        flexGrow: 0,
    },
    listDetailsWrap: {
        flex: 1,
        display: 'flex',
        flexOrientation: 'row',
    },
    filterWrap: {
        clear: 'both',
        minHeight: 80,
    },
    box: {
        display: 'inline-block',
        marginRight: 16,
        width: 256,
    },
    topPagination: {
        float: 'right',
    },
    bottomPagination: {
        marginTop: '-2rem',
        paddingBottom: '0.5rem',
    },
    filtersDropDownAsync: {
        display: 'relative',
    },
};


// Filters out any actions `edit`, `clone` when the user can not update/edit this modelType
function actionsThatRequireCreate(action) {
    const modelDef = this.props.getModelDefinitionByName(this.props.params.modelType);
    if ((action !== 'edit' && action !== 'clone') || this.props.getCurrentUser().canUpdate(modelDef)) {
        return true;
    }
    return false;
}

// Filters out the `delete` when the user can not delete this modelType
function actionsThatRequireDelete(action) {
    const modelDef = this.props.getModelDefinitionByName(this.props.params.modelType);
    if (action !== 'delete' || this.props.getCurrentUser().canDelete(modelDef)) {
        return true;
    }
    return false;
}

export function getTranslatablePropertiesForModelType(modelType, model) {
    const fieldsForModel = new Set(fieldOrder.for(modelType));
    const defaultTranslatableProperties = ['name', 'shortName'];

    if(!model) {
        return defaultTranslatableProperties
    }
    return model.modelDefinition
        .getTranslatableProperties()
        .filter(prop => fieldsForModel.has(prop)); // ensure translationkey is in model-form
}

const modelsThatMapToOtherDisplayName = {
    program: {
        programType: {
            WITH_REGISTRATION: 'TRACKER_PROGRAM',
            WITHOUT_REGISTRATION: 'EVENT_PROGRAM',
        },
    },
};

function getConstantDisplayNameOrOld(modelType, fieldName, oldVal) {
    return (modelsThatMapToOtherDisplayName[modelType] && modelsThatMapToOtherDisplayName[modelType][fieldName])
        ? modelsThatMapToOtherDisplayName[modelType][fieldName][oldVal]
        : oldVal;
}

class List extends Component {
    state = {
        dataRows: [],
        pager: {
            total: 0,
        },
        isLoading: true,
        detailsObject: null,
        sharing: {
            model: null,
            open: false,
        },
        translation: {
            model: null,
            open: false,
        },
        orgunitassignment: {
            model: null,
            open: false,
        },
        dataElementOperand: {
            model: null,
            open: false,
        },
        predictorDialog: {
            open: false,
        },
    }

    componentWillMount() {
        this.observerDisposables = [];

        const sourceStoreDisposable = listStore
            .subscribe((listStoreValue) => {
                if (!isIterable(listStoreValue.list) || listStoreValue.modelType !== this.props.params.modelType) {
                    this.setState({
                        isLoading: true,
                    })
                    return; // Received value is not iterable or not correct model, keep waiting
                }
                listActions.hideDetailsBox();
                this.setState({
                    dataRows: listStoreValue.list,
                    pager: listStoreValue.pager,
                    tableColumns: listStoreValue.tableColumns,
                    filters: listStoreValue.filters,
                    isLoading: false,
                    searchString: listStoreValue.searchString,
                    modelDefinition: listStoreValue.modelDefinition,
                });
            });

        const detailsStoreDisposable = detailsStore.subscribe((detailsObject) => {
            this.setState({ detailsObject });
        });

        const sharingStoreDisposable = sharingStore.subscribe((sharingState) => {
            this.setState(state => ({
                sharing: sharingState,
                dataRows: state.dataRows.map((row) => {
                    if (row.id === sharingState.model.id) {
                        return Object.assign(row, { publicAccess: sharingState.model.publicAccess });
                    }
                    return row;
                }),
            }));
        });

        const translationStoreDisposable = translationStore.subscribe((translationState) => {
            this.setState({
                translation: translationState,
            });
        });

        const dataElementOperandStoreDisposable = dataElementOperandStore.subscribe((state) => {
            this.setState({
                dataElementOperand: state,
            });
        });

        const predictorDialogStoreDisposable = predictorDialogStore.subscribe((state) => {
            this.setState({ predictorDialog: state });
        });

        this.registerDisposable(sourceStoreDisposable);
        this.registerDisposable(detailsStoreDisposable);
        this.registerDisposable(sharingStoreDisposable);
        this.registerDisposable(translationStoreDisposable);
        this.registerDisposable(dataElementOperandStoreDisposable);
        this.registerDisposable(predictorDialogStoreDisposable);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.params.modelType !== newProps.params.modelType) {
            this.setState({
                isLoading: true,
                translation: Object.assign({}, this.state.translation, { open: false }),
            });
        }
    }

    componentWillUnmount() {
        this.observerDisposables.forEach(disposable => disposable.unsubscribe());
    }

    getTranslation = key => this.context.d2.i18n.getTranslation(key);

    registerDisposable(disposable) {
        this.observerDisposables.push(disposable);
    }

    translationSaved = () => {
        snackActions.show({ message: 'translation_saved', translate: true });
    }

    translationError = (errorMessage) => {
        log.error(errorMessage);
        snackActions.show({ message: 'translation_save_error', action: 'ok', translate: true });
    }

    isContextActionAllowed = (model, action) => {
        // Don't allow anything if we can't determine the access
        if (!model || !model.access) {
            return false;
        }

        // TODO: Remove categoryOptionCombo available actions hack when this is sorted through the API
        if (model.modelDefinition.name === 'categoryOptionCombo') {
            if (action === 'edit') {
                return model.access.write;
            }

            if (action === 'details') {
                return model.access.read;
            }

            return false;
        }

        // Shortcut for access detection where action names match to access properties
        if (model.access.hasOwnProperty(action)) {
            return model.access[action];
        }

        if ((action === 'runNow') && (model.modelDefinition.name === 'predictor')) {
            return this.context.d2.currentUser.authorities.has('F_PREDICTOR_RUN');
        }

        // Switch action for special cases
        switch (action) {
        case 'edit':
            return model.modelDefinition.name !== 'locale' && model.access.write;
        case 'clone':
            return !['dataSet', 'program', 'locale', 'sqlView', 'optionSet'].includes(model.modelDefinition.name) &&
                model.access.write;
        case 'translate':
            return model.access.read && model.modelDefinition.identifiableObject && model.modelDefinition.name !== 'sqlView';
        case 'details':
            return model.access.read;
        case 'share':
            return model.modelDefinition.isShareable === true && model.access.write;
        case 'compulsoryDataElements':
            return model.modelDefinition.name === 'dataSet' && model.access.write;
        case 'sectionForm':
            return model.modelDefinition.name === 'dataSet' && model.access.write;
        case 'dataEntryForm':
            return model.modelDefinition.name === 'dataSet' && model.access.write;
        case 'pdfDataSetForm':
            return model.modelDefinition.name === 'dataSet' && model.access.read;
        case 'runNow':
            return model.modelDefinition.name === 'pushAnalysis' && model.access.write;
        case 'preview':
            return model.modelDefinition.name === 'pushAnalysis' && model.access.write;
        case 'executeQuery':
            return model.modelDefinition.name === 'sqlView' && model.access.read && ['MATERIALIZED_VIEW', 'VIEW'].includes(model.type);
        case 'refresh':
            return model.modelDefinition.name === 'sqlView' && model.access.read && model.type === 'MATERIALIZED_VIEW';
        case 'showSqlView':
            return model.modelDefinition.name === 'sqlView' && model.access.read;
        default:
            return true;
        }
    }

    searchListByName = (searchObserver) => {
        const searchListByNameDisposable = searchObserver
            .subscribe((value) => {
                this.setState({
                    isLoading: true,
                });

                listActions.searchByName({ modelType: this.props.params.modelType, searchString: value })
                    .subscribe(() => {}, error => log.error(error));
            });

        this.registerDisposable(searchListByNameDisposable);
    }

    closeTranslationDialog = () => {
        translationStore.setState(Object.assign({}, translationStore.state, {
            open: false,
        }));
    }

    closeSharingDialog = (sharingState) => {
        const model = sharingState
            ? Object.assign(sharingStore.state.model, { publicAccess: sharingState.publicAccess })
            : sharingStore.state.model;

        sharingStore.setState(Object.assign({}, sharingStore.state, {
            model,
            open: false,
        }));
    }

    closeDataElementOperandDialog = () => {
        dataElementOperandStore.setState(Object.assign({}, dataElementOperandStore.state, {
            open: false,
        }));
    }

    renderFilters = () => {
        const makeFilterSetter = filterField => (e) => {
            this.setState({ isLoading: true });
            listActions.setFilterValue({
                filterField,
                filterValue: e.target.value,
                modelType: this.props.params.modelType,
            });
        };

        return (
            <div>
                <SearchBox initialValue={this.state.searchString} searchObserverHandler={this.searchListByName} />
                {getFilterFieldsForType(this.props.params.modelType).map((filterField) => {
                    const modelDefinition = this.context.d2.models[this.props.params.modelType];

                    const isConstantField = modelDefinition.modelProperties.hasOwnProperty(filterField)
                                            && modelDefinition.modelProperties[filterField].hasOwnProperty('constants');

                    const constants = isConstantField
                        && modelDefinition.modelProperties[filterField].constants.map(c =>
                            ({
                                text: getConstantDisplayNameOrOld(this.props.params.modelType, filterField, c),
                                value: c,
                            }));

                    const referenceType = this.context.d2.models.hasOwnProperty(filterField)
                        ? filterField
                        : `${this.props.params.modelType}.${filterField}`;

                    return (
                        <div key={filterField} style={styles.box}>
                            {isConstantField
                                ? (<Dropdown
                                    labelText={this.getTranslation(filterField)}
                                    options={constants}
                                    onChange={makeFilterSetter(filterField)}
                                    value={this.state.filters ? this.state.filters[filterField] : null}
                                    translateOptions={filterField !== 'periodType'}
                                />)
                                : (<DropdownAsync
                                    labelText={this.getTranslation(filterField)}
                                    referenceType={referenceType}
                                    onChange={makeFilterSetter(filterField)}
                                    value={this.state.filters ? this.state.filters[filterField] : null}
                                    quickAddLink={false}
                                    preventAutoDefault
                                    style={styles.filterDrowDownAsync}
                                    limit={1}
                                    top={-15}
                                />)
                            }
                        </div>
                    );
                })}
            </div>
        );
    }

    renderContextMenuHeader() {
        const { modelDefinition } = this.state;
        const queryParamFilters = modelDefinition.filters.getQueryFilterValues();
        const downloadObjectProps = {
            name: modelDefinition.name,
            pluralName: modelDefinition.plural,
            queryParamFilters,
            objectCount: this.state.pager.total
        }
        const actions = [
            {
                title: this.getTranslation('manage_columns'),
                icon: 'view_column',
                action: this.props.openColumnsDialog
            },
            {
                title: this.getTranslation('download'),
                icon: 'get_app',
                action: () => this.props.openDialog(DIALOGTYPES.DOWNLOAD_OBJECT, downloadObjectProps)
            },
        ]
        return <ContextMenuHeader actions={actions} />
    }

    render() {
        const currentlyShown = calculatePageValue(this.state.pager);

        const paginationProps = {
            hasNextPage: () => Boolean(this.state.pager.hasNextPage) && this.state.pager.hasNextPage(),
            hasPreviousPage: () => Boolean(this.state.pager.hasPreviousPage) && this.state.pager.hasPreviousPage(),
            onNextPageClick: () => {
                this.setState({ isLoading: true });
                listActions.getNextPage();
            },
            onPreviousPageClick: () => {
                this.setState({ isLoading: true });
                listActions.getPreviousPage();
            },
            total: this.state.pager.total,
            currentlyShown,
        };

        const availableActions = Object.keys(contextActions)
            .filter(actionsThatRequireCreate, this)
            .filter(actionsThatRequireDelete, this)
            .filter((actionName) => {
                if (actionName === 'share') {
                    return this.context.d2.models[this.props.params.modelType] &&
                        this.context.d2.models[this.props.params.modelType].isShareable;
                }
                return true;
            })
            .reduce((actions, actionName) => {
                // TODO: Don't re-assign param?
                actions[actionName] = contextActions[actionName]; // eslint-disable-line no-param-reassign
                return actions;
            }, {});

        const contextMenuIcons = {
            clone: 'content_copy',
            sharing: 'share',
            sectionForm: 'assignment_turned_in',
            dataEntryForm: 'assignment',
            pdfDataSetForm: 'picture_as_pdf',
            compulsoryDataElements: 'border_color',
            runNow: 'queue_play_next',
            preview: 'dashboard',
            executeQuery: 'playlist_play',
            refresh: 'refresh',
            showSqlView: 'view_module',
        };

        // For table columns like 'a___b', flatten values to b being a child of a
        const magicallyUnwrapChildValues = (row) => {
            this.state.tableColumns.reduce((o, col) => {
                if (col.includes('___')) {
                    const objectName = col.substr(0, col.indexOf('___'));
                    const objectProp = col.substr(col.indexOf('___') + 3);
                    Object.assign(o, {
                        [col]: (row && row[objectName]) ? row[objectName][objectProp] : '',
                    });
                }
                return o;
            }, row);
            return row;
        };

        // Because "default" really means "None" and that's something everybody knows duh
        const defaultReallyMeansNone = (row) => {
            if (row.categoryCombo &&
                row.categoryCombo.displayName &&
                row.categoryCombo.displayName === 'default' &&
                row.categoryCombo___displayName === row.categoryCombo.displayName
            ) {
                row.categoryCombo___displayName = this.getTranslation('none');
                row.categoryCombo.displayName = this.getTranslation('none');
            }
            return row;
        };

        // Get translations for row values that are constants
        // Some props are read only on the model object, which means the can not be translated - boo!
        const translateConstants = (row) => {
            const untranslatableColumnNames = {
                organisationUnit: ['level'],
                dataSet: ['formType'],
            };

            const isTranslatable = (modelType, columnName) => {
                const b = !(
                    untranslatableColumnNames.hasOwnProperty(modelType) &&
                    untranslatableColumnNames[modelType].includes(columnName)
                );
                return b;
            };

            return row.noMoreGottaTranslateCauseIsDone ? row : this.state.tableColumns.reduce((prow, columnName) => {
                if (isTranslatable(row.modelDefinition.name, columnName) &&
                    row && row.modelDefinition &&
                    row.modelDefinition.modelProperties[columnName] &&
                    row.modelDefinition.modelProperties[columnName].constants
                ) {
                    // Hack it to fix another hack - sweeet
                    row.noMoreGottaTranslateCauseIsDone = true;
                    if (row[columnName]) {
                        prow[columnName] = this.getTranslation(getConstantDisplayNameOrOld(row.modelDefinition.name, columnName, row[columnName]).toLowerCase());
                    }
                }
                return prow;
            }, row);
        };

        const primaryAction = (model) => {
            if (model.access.write && model.modelDefinition.name !== 'locale') {
                availableActions.edit(model);
            } else {
                // TODO: The no access message should be replaced with the read-only mode described in DHIS2-1773
                const msg = model.modelDefinition.name === 'locale' ?
                    'locales_can_only_be_created_and_deleted' :
                    'you_do_not_have_permissions_to_edit_this_object';

                snackActions.show({
                    message: msg,
                    translate: true,
                    action: 'dismiss',
                });
            }
        };

        return (
            <div>
                <div>
                    <Heading>
                        {this.getTranslation(`${camelCaseToUnderscores(this.props.params.modelType)}_management`)}
                        <HelpLink schema={this.props.params.modelType} />
                    </Heading>
                    <ListActionBar modelType={this.props.params.modelType} groupName={this.props.params.groupName} />
                </div>
                <div style={styles.filterWrap}>
                    <div style={styles.topPagination}><Pagination {...paginationProps} /></div>
                    {this.renderFilters()}
                </div>
                <LoadingStatus
                    loadingText={['Loading', this.props.params.modelType, 'list...'].join(' ')}
                    isLoading={this.state.isLoading}
                />
                {this.state.isLoading
                    ? (<div>Loading...</div>)
                    : (
                        <div style={styles.listDetailsWrap}>
                            <div style={styles.dataTableWrap}>
                                {!!this.state.dataRows && !!this.state.dataRows.length
                                    ? (<DataTable
                                        rows={
                                            this.state.dataRows
                                                .map(magicallyUnwrapChildValues)
                                                .map(defaultReallyMeansNone)
                                                .map(translateConstants)
                                        }
                                        columns={this.state.tableColumns}
                                        contextMenuActions={availableActions}
                                        contextMenuIcons={contextMenuIcons}
                                        primaryAction={primaryAction}
                                        isContextActionAllowed={this.isContextActionAllowed}
                                        contextMenuHeader={this.renderContextMenuHeader()}
                                    />)
                                    : <div>{this.getTranslation('no_results_found')}</div>}
                            </div>
                            {!!this.state.detailsObject &&
                                <DetailsBoxWithScroll
                                    style={styles.detailsBoxWrap}
                                    detailsObject={this.state.detailsObject}
                                    onClose={listActions.hideDetailsBox}
                                />}
                        </div>
                    )
                }
                {(!!this.state.dataRows && !!this.state.dataRows.length) &&
                    (<div style={styles.bottomPagination}>
                        <Pagination {...paginationProps} />
                    </div>)}
                {!!this.state.sharing.model &&
                    <SharingDialog
                        d2={this.context.d2}
                        id={this.state.sharing.model.id}
                        type={this.props.params.modelType}
                        open={this.state.sharing.model && this.state.sharing.open}
                        onRequestClose={this.closeSharingDialog}
                        bodyStyle={{ minHeight: '400px' }}
                    />}
                {!!this.state.translation.model &&
                    <TranslationDialog
                        objectToTranslate={this.state.translation.model}
                        objectTypeToTranslate={this.state.translation.model && this.state.translation.model.modelDefinition}
                        open={this.state.translation.open}
                        onTranslationSaved={this.translationSaved}
                        onTranslationError={this.translationError}
                        onRequestClose={this.closeTranslationDialog}
                        fieldsToTranslate={getTranslatablePropertiesForModelType(this.props.params.modelType, this.state.translation.model)}
                    />}
                <CompulsoryDataElementOperandDialog
                    model={this.state.dataElementOperand.model}
                    dataElementOperands={this.state.dataElementOperand.dataElementOperands}
                    open={this.state.dataElementOperand.open}
                    onRequestClose={this.closeDataElementOperandDialog}
                />
                {this.state.predictorDialog && <PredictorDialog />}
                <DialogRouter groupName={this.props.params.groupName}
                        modelType={this.props.params.modelType} />
            </div>
        );
    }
}

List.propTypes = {
    params: PropTypes.shape({
        modelType: PropTypes.string.isRequired,
        groupName: PropTypes.string.isRequired,
    }).isRequired,
};

List.contextTypes = {
    d2: PropTypes.object.isRequired,
};

const mapDispatchToProps = {
    openColumnsDialog,
    openDialog
}

export default connect(null, mapDispatchToProps)(withAuth(List));
