import React from 'react'
import { loadEventProgram } from '../EditModel/event-program/actions';
import EditProgram from '../EditModel/event-program/EditProgram.component'
import { resetActiveStep } from '../EditModel/stepper/stepper.actions';
import { createLoaderForSchema } from './createLoaderForSchema'

const loader = createLoaderForSchema('program', loadEventProgram, resetActiveStep)

export class EditForProgramModel extends React.Component {
  componentDidMount() {
    const { params } = this.props.match
    const { location } = this.props
    loader({ params, location })
  }

  render() {
    const { params } = this.props.match
    return <EditProgram params={params} />
  }
}
