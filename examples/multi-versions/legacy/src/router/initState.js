import { initAppState } from '../App/appStateStore';

export function initState({ params }) {
  initAppState({
    sideBar: {
      currentSection: params.groupName,
      currentSubSection: params.modelType,
    },
  });
}
