import React from 'react'
import OrgUnitLevels from '../OrganisationUnitLevels/OrganisationUnitLevels.component'
import { initStateOrgUnitList } from './initStateOrgUnitList'

export class OrganisationUnitLevels extends React.Component {
  componentDidMount() {
    initStateOrgUnitList(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <OrgUnitLevels params={params} />
  }
}
