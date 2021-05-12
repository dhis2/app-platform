export default function handleSW(config) {
    const pwaEnabled = process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true' // env vars are strings
    if (pwaEnabled) {
        register({
            // These callbacks can be used to prompt user to activate new service worker.
            // onUpdate is called when a previous SW exists and a new one is installed;
            // This CB plus the 'controllerchange' listener below are an example
            // TODO: `import { handleNewSwReady } from './serviceWorkerInterface'`
            // TODO: `onUpdate: handleNewSwReady`
            onUpdate: registration => {
                const userConfirms = window.confirm(
                    'New service worker installed and ready to activate. Reload and activate now?'
                )
                if (userConfirms) {
                    // Instruct waiting service worker to skip waiting and activate
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                }
                console.log(
                    'New service worker installed and ready to activate',
                    registration
                )
            },
            // Called when installed for the first time. Probably not necessary
            onSuccess: registration =>
                console.log('New service worker active', registration),
        })
    } else {
        console.log('PWA is not enabled.')
        unregister()
    }

    // TODO: The following content should be replaced by 'serviceWorkerInterface.js'
    let reloaded
    if ('serviceWorker' in navigator) {
        // Reload when new ServiceWorker becomes active
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            if (reloaded) return
            reloaded = true
            window.location.reload()
        })

        // TODO: These are placeholders
        // Service worker message listeners
        navigator.serviceWorker.onmessage = event => {
            if (event.data && event.data.type === 'RECORDING_ERROR') {
                console.error(
                    '[App] Received recording error',
                    event.data.payload.error
                )
            }

            // Option to add more logic here
            if (
                event.data &&
                event.data.type === 'CONFIRM_RECORDING_COMPLETION'
            ) {
                console.log('[App] Confirming completion')
                navigator.serviceWorker.controller.postMessage({
                    type: 'COMPLETE_RECORDING',
                })
            }
        }
    }
}

/* CRA Boilerplate below */

// This optional code is used to register a service worker.
// register() is not called by default.

// This lets the app load faster on subsequent visits in production, and gives
// it offline capabilities. However, it also means that developers (and users)
// will only see deployed updates on subsequent visits to a page, after all the
// existing tabs open on the page have been closed, since previously cached
// resources are updated in the background.

// To learn more about the benefits of this model and instructions on how to
// opt-in, read https://cra.link/PWA

const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
        // [::1] is the IPv6 localhost address.
        window.location.hostname === '[::1]' ||
        // 127.0.0.0/8 are considered localhost for IPv4.
        window.location.hostname.match(
            /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
        )
)

export function register(config) {
    if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
        // The URL constructor is available in all browsers that support SW.
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets; see https://github.com/facebook/create-react-app/issues/2374
            return
        }

        window.addEventListener('load', () => {
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

            if (isLocalhost) {
                // This is running on localhost. Let's check if a service worker still exists or not.
                checkValidServiceWorker(swUrl, config)

                // Add some additional logging to localhost, pointing developers to the
                // service worker/PWA documentation.
                navigator.serviceWorker.ready.then(() => {
                    console.log(
                        'This web app is being served cache-first by a service ' +
                            'worker. To learn more, visit https://cra.link/PWA'
                    )
                })
            } else {
                // Is not localhost. Just register service worker
                registerValidSW(swUrl, config)
            }
        })
    }
}

function registerValidSW(swUrl, config) {
    navigator.serviceWorker
        .register(swUrl)
        .then(registration => {
            registration.onupdatefound = () => {
                const installingWorker = registration.installing
                if (installingWorker == null) {
                    return
                }
                installingWorker.onstatechange = () => {
                    if (installingWorker.state === 'installed') {
                        if (navigator.serviceWorker.controller) {
                            // At this point, the updated precached content has been fetched,
                            // but the previous service worker will still serve the older
                            // content until all client tabs are closed.
                            console.log(
                                'New content is available and will be used when all ' +
                                    'tabs for this page are closed. See https://cra.link/PWA.'
                            )

                            // Execute callback
                            if (config && config.onUpdate) {
                                config.onUpdate(registration)
                            }
                        } else {
                            // At this point, everything has been precached.
                            // It's the perfect time to display a
                            // "Content is cached for offline use." message.
                            console.log('Content is cached for offline use.')

                            // Execute callback
                            if (config && config.onSuccess) {
                                config.onSuccess(registration)
                            }
                        }
                    }
                }
            }
        })
        .catch(error => {
            console.error('Error during service worker registration:', error)
        })
}

function checkValidServiceWorker(swUrl, config) {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then(response => {
            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get('content-type')
            if (
                response.status === 404 ||
                (contentType != null &&
                    contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found. Probably a different app. Reload the page.
                navigator.serviceWorker.ready.then(registration => {
                    registration.unregister().then(() => {
                        window.location.reload()
                    })
                })
            } else {
                // Service worker found. Proceed as normal.
                registerValidSW(swUrl, config)
            }
        })
        .catch(() => {
            console.log(
                'No internet connection found. App is running in offline mode.'
            )
        })
}

export function unregister() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
            .then(registration => {
                registration.unregister()
            })
            .catch(error => {
                console.error(error.message)
            })
    }
}
