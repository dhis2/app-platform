import { getInstance as getD2 } from 'd2/lib/d2';
import { Observable } from 'rxjs';

export const createActionToValidation$ = url => ({data}) => {
    const options = {headers: {'Content-Type': 'text/plain'}};
    const request = getD2()
        .then(d2 => d2.Api.getApi())
        .then(api => api.post(url, data, options))
        .catch(e => getD2().then(d2 => ({
            ...e,
            message: d2.i18n.getTranslation('Expression is empty'),
        })))

    return Observable.fromPromise(request);
};
