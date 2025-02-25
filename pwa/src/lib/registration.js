export const REGISTRATION_STATE_UNREGISTERED = 'UNREGISTERED'
export const REGISTRATION_STATE_WAITING = 'WAITING'
export const REGISTRATION_STATE_FIRST_ACTIVATION = 'FIRST_ACTIVATION'
export const REGISTRATION_STATE_ACTIVE = 'ACTIVE'

async function getRegistration() {
    if (!('serviceWorker' in navigator)) {
        return undefined
    }
    return await navigator.serviceWorker.getRegistration()
}

// These states are technically not mutually-exclusive,
// but we only care about the "most relevant" state
export async function getRegistrationState() {
    const registration = await getRegistration()

    if (!registration) {
        return REGISTRATION_STATE_UNREGISTERED
    } else if (registration.waiting) {
        // An update is available
        return REGISTRATION_STATE_WAITING
    } else if (registration.active) {
        if (navigator.serviceWorker.controller === null) {
            return REGISTRATION_STATE_FIRST_ACTIVATION
        }
        return REGISTRATION_STATE_ACTIVE
    }
}

/**
 * Can receive a specific SW instance to check for updates on, e.g. for a
 * plugin window. Defaults to this window's navigator.serviceWorker.
 * onUpdate is called with `{ registration }`
 */
export async function checkForUpdates({ onUpdate, targetServiceWorker }) {
    if (!('serviceWorker' in navigator) && !targetServiceWorker) {
        return
    }
    const serviceWorker = targetServiceWorker || navigator.serviceWorker

    let registration = await serviceWorker.getRegistration()
    if (registration === undefined) {
        // This could have raced before the call to `serviceWorker.register()`;
        // wait and try again. Testing with a 20x CPU throttling in Chrome,
        // 500 ms works on an M3 max macbook pro
        await new Promise((r) => setTimeout(r, 500))
        registration = await serviceWorker.getRegistration()
        if (registration === undefined) {
            // Still didn't find it; probably not a PWA app.
            return
        }
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
    } else if (registration.active && serviceWorker.controller === null) {
        handleFirstSWActivation()
    }

    function handleInstallingWorker() {
        const installingWorker = registration.installing
        if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
                if (
                    installingWorker.state === 'installed' &&
                    serviceWorker.controller
                ) {
                    // SW is waiting to become active
                    handleWaitingSW()
                } else if (
                    installingWorker.state === 'activated' &&
                    !serviceWorker.controller
                ) {
                    // First SW is installed and active
                    handleFirstSWActivation()
                }
            })
        }
    }

    // If a service worker is installing:
    if (registration.installing) {
        handleInstallingWorker()
    }

    // If a new service worker will be installed:
    registration.addEventListener('updatefound', handleInstallingWorker)
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
            const swUrl = new URL('service-worker.js', publicUrl)

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
