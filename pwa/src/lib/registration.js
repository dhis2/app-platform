export async function checkForUpdates({ onUpdate }) {
    if (!('serviceWorker' in navigator)) {
        return
    }

    const registration = await navigator.serviceWorker.getRegistration()
    if (registration === undefined) {
        return
    }

    function handleWaitingSW() {
        console.log(
            'New content is available and will be used when all tabs for this page are closed.'
        )

        // Execute callback
        if (onUpdate) {
            onUpdate({ registration })
        }
    }

    // Handle active but not-controlling worker
    // (which happens on first installation, if clients.claim() is not used)
    function handleFirstSWActivation() {
        console.log(
            'This app is ready for offline usage. Refresh to use offline features.'
        )

        if (onUpdate) {
            onUpdate({ registration, firstActivation: true })
        }
    }

    // Sometimes a service worker update is triggered by a navigation
    // event in scope, but the registration logic doesn't run on that
    // page, for example if a user hits the login modal. The 'onUpdate'
    // callback doesn't get called in that case. Handle that here:
    if (registration.waiting) {
        handleWaitingSW()
    } else if (
        registration.active &&
        navigator.serviceWorker.controller === null
    ) {
        handleFirstSWActivation()
    }

    function handleInstallingWorker() {
        const installingWorker = registration.installing
        if (installingWorker) {
            installingWorker.onstatechange = () => {
                if (
                    installingWorker.state === 'installed' &&
                    navigator.serviceWorker.controller
                ) {
                    // SW is waiting to become active
                    handleWaitingSW()
                } else if (
                    installingWorker.state === 'activated' &&
                    !navigator.serviceWorker.controller
                ) {
                    // First SW is installed and active
                    handleFirstSWActivation()
                }
            }
        }
    }

    // If a service worker is installing:
    if (registration.installing) {
        handleInstallingWorker()
    }

    // If a new service worker will be installed:
    registration.onupdatefound = handleInstallingWorker
}

/**
 * If a service worker is installing or waiting, wait for updates using
 * `checkForUpdates`, then skip waiting and reload. In other circumstances,
 * just reload.
 *
 * Intended for use at a fatal error boundary to make it possible to activate
 * a waiting service worker via the user interface when alerts aren't available
 */
export async function checkForSWUpdateAndReload() {
    const reload = () => window.location.reload()

    if (!('serviceWorker' in navigator)) {
        return reload()
    }

    // 1. Check if there's a SW (if no, reload)
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration === undefined) {
        return reload()
    }

    // 2. Check if updates are ready (if no, reload)
    if (!registration.waiting && !registration.installing) {
        return reload()
    }

    // 3. If updates are ready, wait for them, _then_ reload
    checkForUpdates({
        onUpdate: (reg) => {
            navigator.serviceWorker.oncontrollerchange = reload
            reg.waiting.postMessage({ type: 'SKIP_WAITING' })
        },
    })
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
            // By compiling the dev SW to the 'public' dir, this URL works in
            // both dev and production modes
            const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`

            if (isLocalhost) {
                // This is running on localhost. Let's check if a service worker still exists or not.
                checkValidSW(swUrl, config)

                // Add some additional logging to localhost, pointing developers
                // to the service worker/PWA documentation.
                navigator.serviceWorker.ready.then(() => {
                    console.log(
                        'This web app is using a service worker. If this is ' +
                            'a production environment, it is being served ' +
                            'cache-first. Learn more at https://cra.link/PWA'
                    )
                })
            } else {
                // Is not localhost. Just register service worker
                registerValidSW(swUrl, config)
            }
        })
    }
}

async function registerValidSW(swUrl /* config */) {
    const reg = await navigator.serviceWorker.getRegistration()
    if (reg?.active && navigator.serviceWorker.controller === null) {
        // The page was hard-reloaded; service worker is disabled
        // (navigator.serviceWorker.controller becomes null after a hard reload)
        // Unregister before registering again to reenable service worker.
        // Will likely cause another refresh due to .oncontrollerchange event
        await unregister()
    }
    navigator.serviceWorker.register(swUrl).catch((error) => {
        console.error('Error during service worker registration:', error)
    })
}

function checkValidSW(swUrl, config) {
    // Check if the service worker can be found. If it can't reload the page.
    fetch(swUrl, {
        headers: { 'Service-Worker': 'script' },
    })
        .then((response) => {
            // Ensure service worker exists, and that we really are getting a JS file.
            const contentType = response.headers.get('content-type')
            if (
                response.status === 404 ||
                (contentType != null &&
                    contentType.indexOf('javascript') === -1)
            ) {
                // No service worker found. Probably a different app. Reload the page.
                navigator.serviceWorker.ready.then((registration) => {
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

/**
 * Note that 'navigator.serviceWorker.ready' may be a gotcha at some point -
 * it only resolves once a service worker is active, and quietly never resolves
 * otherwise (not even rejects). This doesn't cause a problem in the use case
 * in registerValidSW above because 'unregister' will only be called if there
 * is already an active service worker.
 *
 * In the normal, unregister-on-page-load use case, it's fine to never resolve,
 * and useful to wait for an active SW before unregistering if one is
 * installing.
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/ready
 */
export function unregister() {
    if ('serviceWorker' in navigator) {
        return navigator.serviceWorker.ready
            .then((registration) => {
                registration.unregister()
            })
            .catch((error) => {
                console.error(error.message)
            })
    }
    return Promise.resolve()
}
