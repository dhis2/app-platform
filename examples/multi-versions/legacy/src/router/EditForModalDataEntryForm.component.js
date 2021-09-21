import React from 'react'
import EditDataEntryForm from '../EditModel/EditDataEntryForm.component'
import { loadObject } from './loadObject'

export class EditForModalDataEntryForm extends React.Component {
  componentDidMount() {
    loadObject(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <EditDataEntryForm params={params} />
  }
}
