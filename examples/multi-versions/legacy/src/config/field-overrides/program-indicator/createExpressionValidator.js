import { Observable, ReplaySubject } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import { isEmpty, memoize } from 'lodash/fp';

import { ExpressionStatus } from './ExpressionStatusIcon';

export default function createExpressionValidator(path) {
    const validation$ = new ReplaySubject(1);

    const status$ = validation$
        .distinctUntilChanged()
        .debounceTime(300)
        .mergeMap(memoize((expression = '') => Observable.fromPromise(
            getInstance()
                .then((d2) => {
                    if (isEmpty(expression)) {
                        return Observable.of({
                            status: ExpressionStatus.PENDING,
                            message: d2.i18n.getTranslation('expression_is_empty'),
                        });
                    }

                    const api = d2.Api.getApi();
                    const requestOptions = {
                        headers: {
                            'Content-Type': 'text/plain',
                        },
                    };

                    const validation$ = api.post(path, `${expression}`, requestOptions)
                        .then(({ status, description, message }) => ({
                            status: status === 'OK' ? ExpressionStatus.VALID : ExpressionStatus.INVALID,
                            message: status === 'OK' ? description : message,
                            details: description
                        }))
                        .catch((error) => {
                            // If error contains a message and an error status we consider it to be a valid response
                            if (error.message && error.status === 'ERROR') {
                                return {
                                    status: ExpressionStatus.INVALID,
                                    message: error.message,
                                };
                            }
                            // Rethrow if not a valid error
                            throw error;
                        });

                    return Observable.merge(
                        Observable.of({
                            status: ExpressionStatus.PENDING,
                            message: d2.i18n.getTranslation('checking_expression_status'),
                        }),
                        Observable.fromPromise(validation$),
                    );
                }),
        )))
        .concatAll();

    return {
        status$,
        validate(value) {
            validation$.next(value);
        },
    };
}
