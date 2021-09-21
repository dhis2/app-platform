import React from 'react'
import OrganisationUnitHierarchyOrig from '../OrganisationUnitHierarchy'
import { initStateOuHierarchy } from './initStateOuHierarchy'

export class OrganisationUnitSectionHierarchy extends React.Component {
  componentDidMount() {
    initStateOuHierarchy(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <OrganisationUnitHierarchyOrig params={params} />
  }
}
