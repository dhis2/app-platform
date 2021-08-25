import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'typeface-roboto'
import * as serviceWorker from './serviceWorker'

ReactDOM.render(
    <>
        <CssReset />
        <App />
    </>,
    document.getElementById('dhis2-app-root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
