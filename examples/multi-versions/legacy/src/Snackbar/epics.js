import { Observable } from 'rxjs';

import { NOTIFY_USER } from '../EditModel/actions';
import snackActions from './snack.actions';

const showSnackBarMessageEpic = action$ => action$
    .ofType(NOTIFY_USER)
    .do(({ payload: message }) => snackActions.show(message))
    .mergeMapTo(Observable.empty());

export default showSnackBarMessageEpic;
