import Action from 'd2-ui/lib/action/Action';
import { getInstance } from 'd2/lib/d2';
import { Observable } from 'rxjs';
import expressionStatusStore from './expressionStatusStore';

const expressionStatusActions = Action.createActionsFromNames(['requestExpressionStatus']);
expressionStatusActions.requestExpressionStatus
    .debounceTime(500)
    .map((action) => {
        const encodedFormula = encodeURIComponent(action.data);
        const url = `expressions/description?expression=${encodedFormula}`;
        const request = getInstance()
            .then(d2 => d2.Api.getApi().get(url));

        return Observable.fromPromise(request);
    })
    .concatAll()
    .subscribe((response) => {
        expressionStatusStore.setState(response);
    });

export default expressionStatusActions;