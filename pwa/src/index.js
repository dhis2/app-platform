export { setUpServiceWorker } from './service-worker/service-worker.js'
export { OfflineInterface } from './offline-interface/offline-interface.js'
export {
    checkForUpdates,
    checkForSWUpdateAndReload,
    getRegistrationState,
    REGISTRATION_STATE_UNREGISTERED,
    REGISTRATION_STATE_WAITING,
    REGISTRATION_STATE_ACTIVE,
    REGISTRATION_STATE_FIRST_ACTIVATION,
} from './lib/registration.js'
