import { loadObject } from './loadObject';

export function loadOrgUnitObject({ params }) {
  return loadObject({
    params: {
      modelType: 'organisationUnit',
      groupName: params.groupName,
      modelId: params.modelId,
    },
  });
}
