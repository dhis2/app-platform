import { getInstance } from 'd2/lib/d2';
import { history } from 'shared'
import { default as appState } from '../App/appStateStore';
import modelToEditStore from '../EditModel/modelToEditStore';
import objectActions from '../EditModel/objectActions';
import listStore from '../List/list.store';
import snackActions from '../Snackbar/snack.actions';
import { initState } from './initState'

// TODO: We could use an Observable that manages the current modelType
// to load the correct d2.Model. This would clean up the load function
// below.
export function loadObject({ params }) {
  initState({ params });

  return new Promise((resolve, reject) => {
    if (params.modelId === 'add') {
      getInstance().then((d2) => {
        const modelToEdit = d2.models[params.modelType].create();

        // Set the parent for the new organisationUnit to the selected OU
        // TODO: Should probably be able to do this in a different
        // way when this becomes needed for multiple object types
        if (params.modelType === 'organisationUnit') {
          return appState
          // Just take the first value as we don't want this
          // observer to keep updating the state
            .take(1)
            .subscribe((state) => {
              if (state.selectedOrganisationUnit && state.selectedOrganisationUnit.id) {
                modelToEdit.parent = {
                  id: state.selectedOrganisationUnit.id,
                };
              }

              modelToEditStore.setState(modelToEdit);
              resolve(modelToEdit);
            });
        }

        // Use current list filters as default values for relevant fields
        const listFilters = listStore.getState() && Object.keys(listStore.getState().filters)
          .filter(fieldName => modelToEdit.hasOwnProperty(fieldName))
          .filter(fieldName => listStore.getState().filters[fieldName] !== null)
          .filter(fieldName => modelToEdit.modelDefinition.modelValidations[fieldName].writable)
          .reduce((out, modelType) => {
            out[modelType] = listStore.getState().filters[modelType];
            return out;
          }, {});

        modelToEditStore.setState(Object.assign(modelToEdit, listFilters));
        resolve(modelToEdit);
      });
    } else {
      objectActions.getObjectOfTypeById({ objectType: params.modelType, objectId: params.modelId })
        .subscribe(
          resolve,
          (errorMessage) => {
            history.replace(`/list/${params.modelType}`);
            snackActions.show({ message: errorMessage, action: 'ok' });
            reject(errorMessage);
          },
        );
    }
  });
}
