import Store from 'd2-ui/lib/store/Store';
import { getInstance } from 'd2/lib/d2';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import isObject from 'd2-utilizr/lib/isObject';
import snackActions from '../Snackbar/snack.actions';
import { curry, map, contains, __, uniq, keys } from 'lodash/fp';
import maintenanceModels from '../config/maintenance-models';
import systemSettingsStore from './systemSettingsStore';

const appState = Store.create();

const requireAddToView = curry((d2, systemSettings, schemaName) => {
    if (systemSettings.keyRequireAddToView === true) {
        return d2.currentUser.canUpdate(d2.models[schemaName]) || d2.currentUser.canCreate(d2.models[schemaName]);
    }

    return true;
});

function getItemsForCategory(d2, items) {
    const modelDefinitionNames = uniq(keys(d2.models));
    const systemSettings = systemSettingsStore.getState();

    const onlyModelsThatExist = contains(__, modelDefinitionNames);
    const onlyAccessibleModels = requireAddToView(d2, systemSettings);
    const onlyExistingAndAccessibleModels = value => onlyModelsThatExist(value) && onlyAccessibleModels(value);

    return items
        .filter(onlyExistingAndAccessibleModels)
        .map(key => ({
            key,
            label: d2.i18n.getTranslation(camelCaseToUnderscores(key)),
        }));
}

async function mapSideBarConfigToSideBarItems(sideBarConfig) {
    const d2 = await getInstance();

    return map(sideBarCategory => ({
        name: sideBarCategory,
        items: getItemsForCategory(d2, sideBarConfig[sideBarCategory].items),
    }), Object.keys(sideBarConfig));
}

async function loadSideBarState() {
    const d2 = await getInstance();
    const sideBarConfig = maintenanceModels.getSideBarConfig();
    const sideBarState = await mapSideBarConfigToSideBarItems(sideBarConfig);

    return sideBarState
        .reduce((acc, sideBarCategory) => {
            if (sideBarCategory.items.length || sideBarCategory.name === 'all') {
                acc[sideBarCategory.name] = sideBarCategory.items; // eslint-disable-line no-param-reassign
                acc.mainSections = acc.mainSections.concat([{
                    key: sideBarCategory.name,
                    label: d2.i18n.getTranslation(camelCaseToUnderscores(sideBarCategory.name)),
                }]);
            }
            return acc;
        }, {
            mainSections: [],
        });
}

// TODO: Move the caching of these organisation units to d2.currentUser instead
async function getCurrentUserOrganisationUnits(disableCache = false) {
    if (!disableCache && getCurrentUserOrganisationUnits.currentUserOrganisationUnits) {
        return getCurrentUserOrganisationUnits.currentUserOrganisationUnits;
    }

    const d2 = await getInstance();
    const organisationUnitsCollection = await d2.currentUser.getOrganisationUnits({
        fields: ':all,displayName,path,publicAccess,access,children[id,displayName,path,children::isNotEmpty,publicAccess,access]',
        paging: false
    });

    if (d2.currentUser.authorities.has('ALL') && !organisationUnitsCollection.size) {
        const rootLevelOrgUnits = await d2.models.organisationUnits.list({
            level: 1,
            paging: false,
            fields: [
                'id,displayName,path,publicAccess,access,lastUpdated',
                'children[id,displayName,publicAccess,access,path,children::isNotEmpty]',
            ].join(','),
        });

        getCurrentUserOrganisationUnits.currentUserOrganisationUnits = rootLevelOrgUnits;

        if (rootLevelOrgUnits.size === 0) {
            snackActions.show({
                message: 'no_org_units_add_one_to_get_started',
                translate: true,
            });
        }

        return rootLevelOrgUnits;
    }

    getCurrentUserOrganisationUnits.currentUserOrganisationUnits = organisationUnitsCollection;

    return organisationUnitsCollection;
}

async function loadSelectedOrganisationUnitState() {
    if (appState.state && appState.state.selectedOrganisationUnit) {
        return appState.state.selectedOrganisationUnit;
    }

    const organisationUnitsCollection = await getCurrentUserOrganisationUnits(true);

    return organisationUnitsCollection.toArray()
        .reduce((selectedOU, orgUnit) => {
            if (!selectedOU.path || (selectedOU.path.length > orgUnit.path.length)) {
                return orgUnit;
            }
            return selectedOU;
        }, {});
}

export async function reloadUserOrganisationUnits() {
    const userOrganisationUnits = await getCurrentUserOrganisationUnits(true);

    appState.setState({
        ...appState.getState(),
        userOrganisationUnits,
    });
}

export async function initAppState(startState, disableCache) {
    const [sideBar, selectedOrganisationUnit, userOrganisationUnits] = await Promise.all([
        loadSideBarState(),
        loadSelectedOrganisationUnitState(),
        getCurrentUserOrganisationUnits(disableCache),
    ]);

    const loadedState = {
        selectedOrganisationUnit,
        sideBar,
        mainSections: sideBar.mainSections,
        userOrganisationUnits,
        hierarchy: {
            selectedLeft: [],
            selectedRight: [],
            isProcessing: false,
            leftRoots: userOrganisationUnits.toArray(),
            rightRoots: userOrganisationUnits.toArray(),
        },
    };

    const completeInitState = Object.keys(startState)
        .reduce((newAppState, stateKey) => {
            if (newAppState[stateKey]) {
                if (isObject(newAppState[stateKey])) {
                    newAppState[stateKey] = Object.assign({}, newAppState[stateKey], startState[stateKey]);  // eslint-disable-line no-param-reassign
                } else {
                    newAppState[stateKey] = startState[stateKey];  // eslint-disable-line no-param-reassign
                }
            }
            return newAppState;
        }, loadedState);

    appState.setState(completeInitState);
}

export default appState;

export function setAppState(newPartialState) {
    appState.setState(Object.assign({}, appState.state, newPartialState));
}

export const currentSubSection$ = appState
    .map(state => state.sideBar.currentSubSection)
    .distinctUntilChanged();
