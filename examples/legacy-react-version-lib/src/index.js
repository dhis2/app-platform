import React from 'react'
import ReactDOM from 'react-dom'
import { LegacyApp } from './LegacyApp'

export default () => {
    let mountPoint
    const mount = (domElement, props) => {
        if (mountPoint) {
            unmount()
        }
        mountPoint = domElement
        update(props)
    }

    const unmount = () => {
        ReactDOM.unmountComponentAtNode(mountPoint)
    }

    const update = props => {
        console.log(`Rendering legacy app - React ${React.version}`)
        ReactDOM.render(<LegacyApp {...props} />, mountPoint)
    }

    return {
        mount,
        unmount,
        update,
    }
}
