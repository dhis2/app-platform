import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App.js'
import 'typeface-roboto'
import './index.css'

ReactDOM.render(
    <>
        <CssReset />
        <App />
    </>,
    document.getElementById('dhis2-app-root')
)
