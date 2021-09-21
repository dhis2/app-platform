import React from 'react'
import EditOptionSet from '../EditModel/EditOptionSet.component'
import { loadOptionSetObject } from './loadOptionSetObject'

export class EditForOptionSetModel extends React.Component {
  componentDidMount() {
    loadOptionSetObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditOptionSet params={params} />
  }
}
