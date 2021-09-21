import { history } from 'shared'
import objectActions from '../EditModel/objectActions';
import snackActions from '../Snackbar/snack.actions';
import { initState } from './initState'

export function cloneObject({ params }) {
  initState({ params });
  return new Promise((resolve, reject) => {
    objectActions
      .getObjectOfTypeByIdAndClone({ objectType: params.modelType, objectId: params.modelId })
      .subscribe(
        resolve,
        (errorMessage) => {
          history.replace(`/list/${params.modelType}`);
          snackActions.show({ message: errorMessage, action: 'ok' });
          reject(errorMessage);
        },
      );
  });
}
