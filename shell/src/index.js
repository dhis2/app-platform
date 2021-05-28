import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'typeface-roboto'

ReactDOM.render(
    <>
        <CssReset />
        <App />
    </>,
    document.getElementById('root')
)
