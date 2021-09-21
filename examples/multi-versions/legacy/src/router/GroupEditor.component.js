import React from 'react'
import GroupEditorOrig from '../GroupEditor/GroupEditor.component'
import { initState } from './initState'

export class GroupEditor extends React.Component {
  componentDidMount() {
    initState(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <GroupEditorOrig params={params} />
  }
}
