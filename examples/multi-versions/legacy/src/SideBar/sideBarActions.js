import Action from 'd2-ui/lib/action/Action';
import { setAppState, default as appState } from '../App/appStateStore';
import { goToRoute } from '../router-utils';
import { Observable } from 'rxjs';
import searchForOrganisationUnitsWithinHierarchy from '../OrganisationUnitHierarchy/searchForOrganisationUnitsWithinHierarchy';

export const onSectionChanged = Action.create('onSectionChanged', 'SideBar');

onSectionChanged
    .subscribe(({ data }) => {
        if (data.section === 'organisationUnitSection' && data.subSection === 'hierarchy') {
            return goToRoute(`${data.section}/${data.subSection}`);
        }

        if (data.section) {
            setAppState({
                sideBar: Object.assign({}, appState.state.sideBar, {
                    currentSection: data.section,
                    currentSubSection: data.subSection,
                }),
            });
            return goToRoute(`/list/${data.section}/${data.subSection}`);
        }

        // When clicking a mainSection the subSection passed in is actually a mainSection.
        // TODO: Make this code less confusing and reduce the duplication
        setAppState({
            sideBar: Object.assign({}, appState.state.sideBar, {
                currentSection: data.subSection,
                currentSubSection: undefined,
            }),
        });
        return goToRoute(`/list/${data.subSection}`);
    });

export const onBackToSections = Action.create('onSectionChanged', 'SideBar');
onBackToSections
    .subscribe(() => {
        goToRoute('/');
    });

export const onOrgUnitSearch = Action.create('onOrgUnitSearch', 'SideBar');
onOrgUnitSearch
    .distinctUntilChanged()
    .debounceTime(400)
    .map(({ complete, error, data }) => Observable.fromPromise(searchForOrganisationUnitsWithinHierarchy(data))
        .map(organisationUnits => ({
            complete,
            error,
            organisationUnits,
        }))
    )
    .concatAll()
    .subscribe(({ complete, organisationUnits }) => {
        setAppState({
            sideBar: Object.assign({ ...appState.state.sideBar }, { organisationUnits }),
        });
        complete();
    });
