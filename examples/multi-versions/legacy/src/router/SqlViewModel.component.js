import React from 'react'
import SqlView from '../SqlView'

export class SqlViewModel extends React.Component {
  render() {
    const { params } = this.props.match
    return <SqlView params={params} />
  }
}
