import EventEmitter from 'events'
import { swMsgs } from '../lib/constants.js'
import { checkForUpdates } from '../lib/registration.js'

// todo: this could be used as a base for the other, larger offline interface

/**
 * This and the following 'test' functions test for PWA features and log errors
 * if there's an issue so they can be reused in the Offline Interface methods.
 *
 * Known situations when navigator.serviceWorker is not available:
 * 1. Private browsing in firefox
 * 2. Insecure contexts (e.g. http that's not local host)
 */
function testSWAvailable({ targetWindow = window }) {
    if ('serviceWorker' in targetWindow.navigator) {
        return true
    }

    const msg =
        (!targetWindow.isSecureContext
            ? 'This window is not a secure context -- see https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts.'
            : '`serviceWorker` is not available on `navigator`.') +
        ' PWA features will not work.'
    console.error(new Error(msg))
    return false
}

/** This exposes an interface to check a  */
export class PWAUpdateOfflineInterface {
    constructor({ targetWindow = window }) {
        if (!testSWAvailable({ targetWindow })) {
            return
        }
        this.targetWindow = targetWindow
        this.serviceWorker = targetWindow.navigator.serviceWorker

        // This event emitter helps coordinate with service worker messages
        this.offlineEvents = new EventEmitter()
        // Receives messages from service worker and forwards to event emitter
        const handleSWMessage = (event) => {
            if (!event.data) {
                return
            }
            const { type, payload } = event.data
            this.offlineEvents.emit(type, payload)
        }
        this.serviceWorker.addEventListener('message', handleSWMessage)
    }

    /** Basically `checkForUpdates` from registration.js exposed here */
    checkForNewSW({ onNewSW }) {
        // Check for SW updates (or first activation)
        checkForUpdates({
            onUpdate: onNewSW,
            targetServiceWorker: this.serviceWorker,
        })
    }

    /**
     * Requests clients info from the active service worker.
     * @returns {Promise}
     */
    getClientsInfo() {
        if (!testSWAvailable({ targetWindow: this.targetWindow })) {
            return Promise.resolve({ clientsCount: 0 })
        }

        return new Promise((resolve, reject) => {
            this.serviceWorker.getRegistration().then((registration) => {
                const newestSW = registration?.waiting || registration?.active
                if (!newestSW) {
                    resolve({ clientsCount: 0 })
                    return
                }

                // Send request message to newest SW
                newestSW.postMessage({ type: swMsgs.getClientsInfo })
                // Resolve with payload received from SW `clientsInfo` message
                this.offlineEvents.once(swMsgs.clientsInfo, resolve)
                // Clean up potentially unused listeners eventually
                setTimeout(() => {
                    reject('Request for clients info timed out')
                    this.offlineEvents.removeAllListeners(swMsgs.clientsInfo)
                }, 2000)
            })
        })
    }

    /**
     * Makes a new SW either skip waiting if it's an update,
     * or claim clients if it's the first SW activation
     */
    useNewSW() {
        if (!testSWAvailable({ targetWindow: this.targetWindow })) {
            return Promise.resolve()
        }

        return this.serviceWorker.getRegistration().then((registration) => {
            if (!registration) {
                throw new Error('No service worker is registered')
            }
            if (registration.waiting) {
                // Update existing service worker
                registration.waiting.postMessage({
                    type: swMsgs.skipWaiting,
                })
            } else if (registration.active) {
                // (First SW activation) Have SW take control of clients
                registration.active.postMessage({
                    type: swMsgs.claimClients,
                })
            }
        })
    }
}
