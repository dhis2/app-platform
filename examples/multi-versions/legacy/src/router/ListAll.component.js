import React from 'react'
import MenuCardsForAllSections from '../MenuCards/MenuCardsForAllSections.component'
import { initState } from './initState'

export class ListAll extends React.Component {
  componentDidMount() {
    initState(this.props.match)
  }

  render() {
    const { params } = this.props.match
    return <MenuCardsForAllSections params={params} />
  }
}
