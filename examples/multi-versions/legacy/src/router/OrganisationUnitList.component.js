import React from 'react'
import OrgUnitList from '../List/organisation-unit-list/OrganisationUnitList.component.js'
import { initStateOrgUnitList } from './initStateOrgUnitList'

export class OrganisationUnitList extends React.Component {
  componentDidMount() {
    initStateOrgUnitList(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <OrgUnitList params={params} />
  }
}
