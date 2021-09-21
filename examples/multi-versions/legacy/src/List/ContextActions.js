import { Subject } from 'rxjs';
import log from 'loglevel';

import { getInstance as getD2 } from 'd2/lib/d2';
import Action from 'd2-ui/lib/action/Action';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';

import detailsStore from './details.store';
import snackActions from '../Snackbar/snack.actions';
import listStore from './list.store';
import sharingStore from './sharing.store';
import translateStore from './translation-dialog/translationStore';
import compulsoryDataElementStore from './compulsory-data-elements-dialog/compulsoryDataElementStore';
import appStore from '../App/appStateStore';
import predictorDialogStore from './predictor-dialog/predictorDialogStore';
import { goToRoute } from '../router-utils';

export const afterDeleteHook$ = new Subject();

const contextActions = Action.createActionsFromNames([
    'edit',
    'clone',
    'share',
    'delete',
    'details',
    'translate',
    'compulsoryDataElements',
    'sectionForm',
    'dataEntryForm',
    'pdfDataSetForm',
    'preview',
    'runNow',
    'executeQuery',
    'refresh',
    'showSqlView',
]);

// TODO: The action assumes that the appState actually has state
contextActions.edit
    .subscribe((action) => {
        goToRoute([
            '/edit',
            appStore.state.sideBar.currentSection,
            action.data.modelDefinition.name,
            action.data.id,
        ].join('/'));
    });

// TODO: The action assumes that the appState actually has state
contextActions.clone
    .subscribe((action) => {
        goToRoute([
            '/clone',
            appStore.state.sideBar.currentSection,
            action.data.modelDefinition.name,
            action.data.id,
        ].join('/'));
    });

contextActions.delete
    .subscribe(({ data: model }) => getD2()
        .then((d2) => {
            snackActions.show({
                message: [
                    d2.i18n.getTranslation(`confirm_delete_${camelCaseToUnderscores(model.modelDefinition.name)}`),
                    model.name,
                ].join(' '),
                action: 'confirm',
                onActionTouchTap: () => {
                    model.delete()
                        .then(() => {
                            // Remove deleted item from the listStore
                            if (listStore.getState() && listStore.getState().list) {
                                listStore.setState({
                                    ...listStore.getState(),
                                    pager: listStore.getState().pager,
                                    list: listStore.getState().list
                                        .filter(modelToCheck => modelToCheck.id !== model.id),
                                });
                            }

                            snackActions.show({
                                message: `${model.displayName} ${d2.i18n.getTranslation('was_deleted')}`,
                            });

                            // Fire the afterDeleteHook
                            afterDeleteHook$.next({
                                model,
                                modelType: model.modelDefinition.name,
                            });
                        })
                        .catch((response) => {
                            log.warn(response);
                            snackActions.show({
                                message: response.message
                                    ? response.message
                                    : `${model.name} ${d2.i18n.getTranslation('was_not_deleted')}`,
                                action: 'ok',
                            });
                        });
                },
            });
        })
    );

contextActions.details
    .subscribe(({ data: model }) => {
        detailsStore.setState(model);
    });

contextActions.share
    .subscribe(async({ data: model }) => {
        const d2 = await getD2();
        const modelToShare = await d2.models[model.modelDefinition.name].get(model.id);

        sharingStore.setState({
            model: modelToShare,
            open: true,
        });
    });

contextActions.translate
    .subscribe(async({ data: model }) => {
        const d2 = await getD2();
        const modelToTranslate = await d2.models[model.modelDefinition.name].get(model.id);

        translateStore.setState({
            model: modelToTranslate,
            open: true,
        });
    });

contextActions.compulsoryDataElements
    .subscribe(async ({ data: model }) => {
        const d2 = await getD2();
        const api = d2.Api.getApi();
        const getModelItem = () => d2.models[model.modelDefinition.name].get(model.id, {
            fields: [
                ':all',
                'id,dataSetElements[id,dataElement[id]]',
                'compulsoryDataElementOperands[id,dataElement[id],categoryOptionCombo[id]]',
            ].join(','),
        });
        const getDataElementOperands = () => api
            .get(
                'dataElementOperands',
                {
                    fields: 'dataElement[id],categoryOptionCombo[id],displayName',
                    totals: false,
                    paging: false,
                    dataSet: model.id,
                },
            )
            .then(responseData => responseData.dataElementOperands);

        // Open dialog immediately so we can show a progress indicator
        compulsoryDataElementStore.setState({
            open: true,
            model: undefined,
            dataElementOperands: [],
        });

        const [modelItem, dataElementOperands] = await Promise.all([getModelItem(), getDataElementOperands()]);

        const dataSetDataElementIds = modelItem.dataSetElements
            .map(dataSetElement => dataSetElement.dataElement.id);

        const dataElementOperandsForDataSet = dataElementOperands
            .map(dataElementOperand => Object.assign(
                dataElementOperand,
                {
                    dataElementId: dataElementOperand.dataElement.id,
                    optionComboId: dataElementOperand.categoryOptionCombo && dataElementOperand.categoryOptionCombo.id,
                },
            ))
            .filter(dataElementOperand => dataSetDataElementIds.indexOf(dataElementOperand.dataElementId) >= 0);

        compulsoryDataElementStore.setState({
            open: true,
            model: modelItem,
            dataElementOperands: dataElementOperandsForDataSet,
        });
    });

contextActions.sectionForm
    .subscribe((action) => {
        goToRoute([
            '/edit',
            appStore.state.sideBar.currentSection,
            action.data.modelDefinition.name,
            action.data.id,
            'sections',
        ].join('/'));
    });

contextActions.dataEntryForm
    .subscribe((action) => {
        goToRoute([
            '/edit',
            appStore.state.sideBar.currentSection,
            action.data.modelDefinition.name,
            action.data.id,
            'dataEntryForm',
        ].join('/'));
    });

contextActions.pdfDataSetForm
    .subscribe(({ data: model, complete, error }) => {
        getD2()
            .then((d2) => {
                window.open(`${d2.Api.getApi().baseUrl}/pdfForm/dataSet/${model.id}`);
            })
            .then(complete)
            .catch(error);
    });

contextActions.runNow
    .subscribe(async ({ data: model, complete: actionComplete, error: actionFailed }) => {
        const d2 = await getD2();

        if (model.modelDefinition.name === 'predictor') {
            predictorDialogStore.setState({ model, open: true });
        } else {
            d2.Api.getApi().post([model.modelDefinition.plural, model.id, 'run'].join('/'))
                .then(() => {
                    snackActions.show({ message: d2.i18n.getTranslation('report_queued_for_delivery') });
                    actionComplete();
                })
                .catch((err) => {
                    snackActions.show({ message: d2.i18n.getTranslation('failed_to_schedule_report'), action: 'ok' });
                    actionFailed(err);
                });
        }
    });

contextActions.preview
    .subscribe(({ data: model, complete: actionComplete, error: actionFailed }) => {
        getD2()
            .then((d2) => {
                window.open(`${d2.Api.getApi().baseUrl}/${[model.modelDefinition.name, model.id, 'render'].join('/')}`);
            })
            .then(actionComplete)
            .catch((err) => {
                // Using fixed text because d2 is not in scope here so message cannot be translated
                snackActions.show({ message: 'Failed to open report preview', action: 'ok' });
                actionFailed(err);
            });
    });

contextActions.executeQuery
    .subscribe(async ({ data: model, complete: actionComplete, error: actionFailed }) => {
        const d2 = await getD2();

        d2.Api.getApi().post(`/sqlViews/${model.id}/execute`)
            .then(() => {
                snackActions.show({ message: d2.i18n.getTranslation('sql_view_executed_successfully') });
                actionComplete();
            })
            .catch((err) => {
                const message = `${d2.i18n.getTranslation('sql_view_execute_error')} - ${err && err.message}`;
                snackActions.show({ message, action: 'ok' });
                actionFailed(err);
            });
    });

contextActions.refresh
    .subscribe(async ({ data: model, complete: actionComplete, error: actionFailed }) => {
        const d2 = await getD2();

        d2.Api.getApi().post(`/sqlViews/${model.id}/refresh`)
            .then(() => {
                snackActions.show({ message: d2.i18n.getTranslation('sql_view_refreshed_successfully') });
                actionComplete();
            })
            .catch((err) => {
                snackActions.show({ message: d2.i18n.getTranslation('sql_view_refresh_error'), action: 'ok' });
                actionFailed(err);
            });
    });

contextActions.showSqlView
    .subscribe(({ data: model }) => {
        goToRoute(`sqlViews/${model.id}`);
    });


export default contextActions;
