import React, { Component } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom'
import { modernizedRoutes } from 'shared'
import App from './App/App.component';
import { legacyRoutes } from './legacy-routes'
import { CloneModel } from './router/CloneModel.component'
import { EditForModalDataEntryForm } from './router/EditForModalDataEntryForm.component'
import { EditForModelSections } from './router/EditForModelSections.component'
import { EditForOptionSetModel } from './router/EditForOptionSetModel.component'
import { EditForOrganisationUnitModel } from './router/EditForOrganisationUnitModel.component'
import { ListForModelType } from './router/ListForModelType.component'
import { ListForGroup } from './router/ListForGroup.component'
import { EditForProgramModel } from './router/EditForProgramModel.component'
import { EditGroupModel } from './router/EditGroupModel.component'
import { GroupEditor } from './router/GroupEditor.component'
import { ListAll } from './router/ListAll.component'
import { OrganisationUnitLevels } from './router/OrganisationUnitLevels.component'
import { OrganisationUnitList } from './router/OrganisationUnitList.component'
import { OrganisationUnitSectionHierarchy } from './router/OrganisationUnitSectionHierarchy.component'
import { SqlViewModel } from './router/SqlViewModel.component'

export class Router extends Component {
  render() {
    return (
      <App>
        <Switch>
          {modernizedRoutes.reduce(
            (acc, { path }) => {
              const { component, path: legacyPath } = legacyRoutes[path]

              return [
                ...acc,
                <Route key={path} path={path} exact render={() => null} />,
                <Route key={legacyPath} path={legacyPath} exact component={component} />
              ]
            },
            []
          )}

          <Route
            path="/list/all"
            component={ListAll}
          />

          <Route
            path="/list/:groupName/organisationUnit"
            component={OrganisationUnitList}
          />

          <Route
            path="/list/:groupName/organisationUnitLevel"
            component={OrganisationUnitLevels}
          />

          <Route
            path="/list/:groupName/:modelType"
            component={ListForModelType}
          />

          <Route
            path="/list/:groupName"
            component={ListForGroup}
          />

          <Route
            path="/edit/:groupName/organisationUnit/:modelId"
            component={EditForOrganisationUnitModel}
          />

          <Route
            path="/edit/:groupName/optionSet/:modelId"
            component={EditForOptionSetModel}
          />

          <Route
            path="/edit/:groupName/program/:modelId"
            component={EditForProgramModel}
          />

          <Route
              path="/edit/:groupName/:modelType/:modelId/sections"
              component={EditForModelSections}
          />

          <Route
              path="/edit/:groupName/:modelType/:modelId/dataEntryForm"
              component={EditForModalDataEntryForm}
          />

          <Route
              path="/edit/:groupName/:modelType/:modelId"
              component={EditGroupModel}
          />

          <Route
              path="/clone/:groupName/:modelType/:modelId"
              component={CloneModel}
          />

          <Route
              path="/group-editor"
              component={GroupEditor}
          />

          <Route
              path="/organisationUnitSection/hierarchy"
              component={OrganisationUnitSectionHierarchy}
          />

          <Route
              path="/sqlViews/:modelId"
              component={SqlViewModel}
          />

          <Route render={() => <Redirect to="/list/all" />} />
        </Switch>
      </App>
    )
  }
}
