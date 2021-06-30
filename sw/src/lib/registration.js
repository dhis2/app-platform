export async function checkForUpdates({ onUpdate }) {
    if (!('serviceWorker' in navigator)) return

    const registration = await navigator.serviceWorker.getRegistration()
    if (registration === undefined) return

    function handleWaitingSW() {
        console.log(
            'New content is available and will be used when all ' +
                'tabs for this page are closed. See https://cra.link/PWA.'
        )

        // Execute callback
        if (onUpdate) onUpdate(registration)
    }

    // Sometimes a service worker update is triggered by a navigation
    // event in scope, but the registration logic doesn't run on that
    // page, for example if a user hits the login modal. The 'onUpdate'
    // callback doesn't get called in that case. Handle that here:
    if (registration.waiting) handleWaitingSW()

    function handleInstallingWorker() {
        const installingWorker = registration.installing
        if (installingWorker) {
            installingWorker.onstatechange = () => {
                if (installingWorker.state !== 'installed') return
                if (navigator.serviceWorker.controller) handleWaitingSW()
                else console.log('Content is cached for offline use.')
            }
        }
    }

    // If a service worker is installing:
    if (registration.installing) handleInstallingWorker()

    // If a new service worker will be installed:
    registration.onupdatefound = handleInstallingWorker
}

export function register(config) {
    const isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
            // [::1] is the IPv6 localhost address.
            window.location.hostname === '[::1]' ||
            // 127.0.0.0/8 are considered localhost for IPv4.
            window.location.hostname.match(
                /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
            )
    )

    if ('serviceWorker' in navigator) {
        // The URL constructor is available in all browsers that support SW.
        const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href)
        if (publicUrl.origin !== window.location.origin) {
            // Our service worker won't work if PUBLIC_URL is on a different origin
            // from what our page is served on. This might happen if a CDN is used to
            // serve assets; see https://github.com/facebook/create-react-app/issues/2374
            return
        }

        window.addEventListener('load', () => {
            // In development mode, a different service worker will be registered
            const prodEnv = process.env.NODE_ENV === 'production'
            console.log(prodEnv)
            const swUrl = prodEnv
                ? `${process.env.PUBLIC_URL}/service-worker.js`
                : `${process.env.PUBLIC_URL}/dev-service-worker.js`

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

function registerValidSW(swUrl /* config */) {
    navigator.serviceWorker.register(swUrl).catch(error => {
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
