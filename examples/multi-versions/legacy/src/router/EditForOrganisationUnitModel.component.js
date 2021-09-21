import React from 'react'
import EditModelContainer from '../EditModel/EditModelContainer.component'
import { loadOrgUnitObject } from './loadOrgUnitObject'

export class EditForOrganisationUnitModel extends React.Component {
  componentDidMount() {
    loadOrgUnitObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditModelContainer params={params} />
  }
}
