import React from 'react'
import OrigList from '../List/List.component'
import { loadList } from './loadList'

export class ListForModelType extends React.Component {
  componentDidMount() {
    loadList(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <OrigList params={params} />
  }
}
