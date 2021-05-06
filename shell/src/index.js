import { CssReset } from '@dhis2/ui'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import 'typeface-roboto'
import * as serviceWorkerRegistration from './serviceWorkerRegistration'

ReactDOM.render(
    <>
        <CssReset />
        <App />
    </>,
    document.getElementById('root')
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://cra.link/PWA
const pwaEnabled = process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true' // env vars are strings
if (pwaEnabled) {
    serviceWorkerRegistration.register({
        // These callbacks can be used to prompt user to activate new service worker
        // Called when a previous SW exists and a new one is installed
        onUpdate: registration => {
            if (
                window.confirm(
                    'New service worker installed and ready to activate. Reload and activate now?'
                )
            ) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' })
            }
            console.log(
                'New service worker installed and ready to activate',
                registration
            )
        },
        // Called when installed for the first time
        onSuccess: registration =>
            console.log('New service worker active', registration),
    })
} else {
    console.log('PWA is not enabled.')
    serviceWorkerRegistration.unregister()
}

let reloaded
if ('serviceWorker' in navigator && process.env.DHIS2_APP_PWA_ENABLED) {
    // Reload when new ServiceWorker becomes active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (reloaded) return
        reloaded = true
        window.location.reload()
    })

    // Service worker message listeners
    navigator.serviceWorker.onmessage = event => {
        if (event.data && event.data.type === 'RECORDING_ERROR') {
            console.error(
                '[App] Received recording error',
                event.data.payload.error
            )
        }

        // Option to add more logic here
        if (event.data && event.data.type === 'CONFIRM_RECORDING_COMPLETION') {
            console.log('[App] Confirming completion')
            navigator.serviceWorker.controller.postMessage({
                type: 'COMPLETE_RECORDING',
            })
        }
    }
}
