import { initAppState } from '../App/appStateStore';

export function initStateOrgUnitList({ params }) {
  initAppState({
    sideBar: {
      currentSection: params.groupName,
      currentSubSection: 'organisationUnit',
    },
  }, true);
}
