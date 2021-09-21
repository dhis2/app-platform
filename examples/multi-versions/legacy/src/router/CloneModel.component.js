import React from 'react'
import EditModelContainer from '../EditModel/EditModelContainer.component'
import { cloneObject } from './cloneObject'

export class CloneModel extends React.Component {
  componentDidMount() {
    cloneObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditModelContainer params={params} />
  }
}
