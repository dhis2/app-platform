export { setUpServiceWorker } from './service-worker/service-worker.js'
export { OfflineInterface } from './offline-interface/offline-interface.js'
export {
    checkForUpdates,
    checkForSWUpdateAndReload,
} from './lib/registration.js'
export { getBaseUrlByAppName, setBaseUrlByAppName } from './lib/base-url-db.js'
