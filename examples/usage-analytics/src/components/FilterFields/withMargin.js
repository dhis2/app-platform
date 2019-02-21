import React from 'react'
import './withMargin.css'

export default function withMargin(ComponentToWrap) {
    return function ComponentWithMargin(props) {
        return (
            <div className="uaa-fieldwrap">
                <ComponentToWrap {...props} />
            </div>
        )
    }
}
