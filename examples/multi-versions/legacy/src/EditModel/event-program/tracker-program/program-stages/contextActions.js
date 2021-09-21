import snackActions from '../../../../Snackbar/snack.actions';
import { afterDeleteHook$ } from '../../../../List/ContextActions';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import { getInstance } from 'd2/lib/d2';
import log from 'loglevel';
import { deleteProgramStage } from './actions';

import store from '../../../../store';

export async function deleteProgramStageWithSnackbar(model) {
    const d2 = await getInstance();

        snackActions.show({
        message: [
            d2.i18n.getTranslation(
                `confirm_delete_${camelCaseToUnderscores(
                    model.modelDefinition.name
                )}`
            ),
            model.name,
        ].join(' '),
        action: 'confirm',

        onActionTouchTap: () => {
            store.dispatch(deleteProgramStage(model.id));

            // Fire the afterDeleteHook
            afterDeleteHook$.next({
                model,
                modelType: model.modelDefinition.name,
            });
        },
    });
}

export function translationSaved() {
    snackActions.show({ message: 'translation_saved', translate: true });
}

export function translationError(errorMessage) {
    log.error(errorMessage);
    snackActions.show({
        message: 'translation_save_error',
        action: 'ok',
        translate: true,
    });
}
