import AppWithD2 from 'd2-ui/lib/app/AppWithD2.component';
import MainContent from 'd2-ui/lib/layout/main-content/MainContent.component';
// import SectionTabs from '../TopBar/SectionTabs.component';
// import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import SinglePanelLayout from 'd2-ui/lib/layout/SinglePanel.component';
import TwoPanelLayout from 'd2-ui/lib/layout/TwoPanel.component';
import { getInstance } from 'd2/lib/d2';
import React from 'react';
// import { goToRoute } from '../router-utils';
import { Provider } from 'react-redux';
import { withRouter } from 'react-router'
import { Observable } from 'rxjs';
import {
  // shouldDisableTabs,
  shouldHideSidebar
, modernizedRoutes } from 'shared'
import LoadingMask from '../loading-mask/LoadingMask.component';
import SideBar from '../SideBar/SideBarContainer.component';
import SnackbarContainer from '../Snackbar/SnackbarContainer.component';
import store from '../store';
import 'typeface-roboto';
import 'material-design-icons-iconfont/dist/material-design-icons.css';

import appState, { setAppState } from './appStateStore';

// const sections$ = appState
//     .map(state => ({
//         sections: state.sideBar.mainSections,
//         current: state.sideBar.currentSection,
//         changeSection: (sectionName) => {
//             setAppState({
//                 sideBar: Object.assign({}, state.sideBar, {
//                     currentSection: sectionName,
//                 }),
//             });
//             goToRoute(`/list/${sectionName}`);
//         },
//     }));
//
// const SectionTabsWrap = withStateFrom(sections$, SectionTabs);

class App extends AppWithD2 {
    componentDidMount() {
        super.componentDidMount();

        // The all section is a special section that should not be treated like a normal section as it does not
        // have the sidebar. It is used to display the collection of all meta data objects. The all section will
        // therefore always emit false.
        const allSectionSelected$ = appState
            .filter(state => state.sideBar.currentSection === 'all')
            .map(() => false);

        const nonAllSectionSelected$ = appState
            // The all section is managed separately so we do not want to process those any further
            .filter(state => state.sideBar.currentSection !== 'all')
            .map(state => (
                // Check if the current section is in the list of mainSections
                state.mainSections.some(mainSection => mainSection.key === state.sideBar.currentSection)
            ));

        this.subscription = Observable
            .merge(allSectionSelected$, nonAllSectionSelected$)
            // Do not emit the value more often than needed to prevent unnecessary react triggers
            .distinctUntilChanged()
            .subscribe(hasSection => this.setState({
                ...this.state,
                hasSection,
            }));
    }

    componentDidUpdate(prevProps) {
      const curPathname = this.props.location.pathname
      const isSectionPath = curPathname.match(/^[/]list[/][^/]+$/)

      if (!isSectionPath) {return}

      const sectionName = curPathname.match(/[/]([^/]+)$/)[1]
      const state = appState.state

      if (!state) {return}

      if (state.sideBar.currentSection !== sectionName) {
        setAppState({
          sideBar: Object.assign({}, state.sideBar, {
            currentSection: sectionName,
          }),
        });
      }
    }

    componentWillUnmount() {
        if (super.componentWillUnmount) { super.componentWillUnmount(); }

        if (this.subscription && this.subscription.unsubscribe) {
            this.subscription.unsubscribe();
        }
    }

    render() {
        const isModernizedRoute = modernizedRoutes.find(({ path }) => {
          return this.props.location.pathname === path
        })

        if (isModernizedRoute) {
          return null
        }

        if (!this.state.d2) {
            return (<LoadingMask />);
        }

        const { match, location } = this.props
        const { params } = match
        const hideSidebar = shouldHideSidebar(location.pathname)
        // const disableTabs = shouldDisableTabs(location.pathname)

        return (
            <Provider store={store}>
                <div>
                    {/* <SectionTabsWrap disabled={!!disableTabs} /> */ ''}
                    {this.state.hasSection && !hideSidebar ? (
                        <TwoPanelLayout>
                            <SideBar
                                activeGroupName={params.groupName}
                                activeModelType={params.modelType}
                            />
                            <MainContent>{this.props.children}</MainContent>
                        </TwoPanelLayout>
                    ) : (
                        <SinglePanelLayout>
                            <MainContent>{this.props.children}</MainContent>
                        </SinglePanelLayout>
                    )}
                    <SnackbarContainer />
                </div>
            </Provider>
        );
    }
}
App.defaultProps = {
    d2: getInstance(),
};

export default withRouter(App);
