import { initAppState } from '../App/appStateStore';

export function initStateOrgUnitLevels({ params }) {
  initAppState({
    sideBar: {
      currentSection: params.groupName,
      currentSubSection: 'organisationUnitLevel',
    },
  });
}
