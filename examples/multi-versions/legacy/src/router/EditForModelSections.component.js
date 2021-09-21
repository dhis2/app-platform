import React from 'react'
import EditDataSetSections from '../EditModel/EditDataSetSections.component'
import { loadObject } from './loadObject'

export class EditForModelSections extends React.Component {
  componentDidMount() {
    loadObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditDataSetSections params={params} />
  }
}
