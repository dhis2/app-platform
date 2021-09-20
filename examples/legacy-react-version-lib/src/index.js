import React from 'react'
import ReactDOM from 'react-dom'

export const Parcel = () => {
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

    const update = (props) => {
        ReactDOM.render(<MyApp {...props} />, mountPoint)
    }
    
    return {
        mount,
        unmount,
        update
    }
}