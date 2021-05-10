import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'typeface-roboto'
import handleSW from './serviceWorkerRegistration'

ReactDOM.render(
    <>
        <CssReset />
        <App />
    </>,
    document.getElementById('root')
)

// Handles service worker registration depending on d2.config.
// If you want your app to work offline and load faster, you can add
// pwa: { enabled: true } in d2.config.json in your app. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
handleSW()
