import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import Plugin from './Plugin.jsx'
import 'typeface-roboto'
import './index.css'

ReactDOM.render(
    <>
        <CssReset />
        <Plugin />
    </>,
    document.getElementById('dhis2-app-root')
)
