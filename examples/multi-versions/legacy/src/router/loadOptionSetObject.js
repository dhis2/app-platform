import { loadObject } from './loadObject';

export function loadOptionSetObject({ params }) {
  return loadObject({
    params: {
      modelType: 'optionSet',
      groupName: params.groupName,
      modelId: params.modelId,
    },
  });
}
