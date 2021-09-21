import React from 'react'
import EditModelContainer from '../EditModel/EditModelContainer.component'
import { loadObject } from './loadObject'

export class EditGroupModel extends React.Component {
  componentDidMount() {
    loadObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditModelContainer params={params} />
  }
}
