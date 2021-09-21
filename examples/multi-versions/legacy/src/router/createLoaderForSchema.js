import store from '../store';
import { initState } from './initState';

export function createLoaderForSchema(
  schema,
  actionCreatorForLoadingObject,
  resetActiveStep
) {
  return ({ location, params }) => {
    const { query } = location

    initState({
      params: {
        modelType: schema,
        groupName: params.groupName,
        modelId: params.modelId,
      },
    });

    // Fire load action for the event program program to be edited
    store.dispatch(
      actionCreatorForLoadingObject({ schema, id: params.modelId, query })
    );
    store.dispatch(resetActiveStep());
  };
}
