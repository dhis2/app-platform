import { initAppState } from '../App/appStateStore';

export function initStateOuHierarchy() {
  initAppState({
    sideBar: {
      currentSection: 'organisationUnitSection',
      currentSubSection: 'hierarchy',
    },
  });
}
