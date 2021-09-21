import noop from 'lodash/fp/noop';
import log from 'loglevel';
import { history } from 'shared'
import listActions from '../List/list.actions';
import { initState } from './initState'

export function loadList({ params }, replace) {
  if (params.modelType === 'organisationUnit') {
    // Don't load organisation units as they get loaded through the
    // appState Also load the initialState without cache so we
    // refresh the assigned organisation units These could have
    // changed by adding an organisation unit which would need to be
    // reflected in the organisation unit tree
    initState({ params });
    return;
  }
  initState({ params });

  return listActions
    .loadList(params.modelType)
    .take(1)
    .subscribe(
      noop,
      (message) => {
        if (/^.+s$/.test(params.modelType)) {
          const nonPluralAttempt = params.modelType.substring(0, params.modelType.length - 1);
          log.warn(`Could not find requested model type '${params.modelType}' attempting to redirect to '${nonPluralAttempt}'`);
          history.replace(`list/${nonPluralAttempt}`);
        } else {
          log.error('No clue where', params.modelType, 'comes from... Redirecting to app root');
          log.error(message);

          history.replace('/');
        }
      },
    );
}
