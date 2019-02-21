import React from 'react'
import PropTypes from 'prop-types'
import './Error.css'

function Error({ message }) {
    return <div className="uaa-error">{message}</div>
}

Error.propTypes = {
    message: PropTypes.string,
}

export default Error
