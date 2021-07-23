const compileServiceWorker = require('./compileServiceWorker')
const getPWAEnvVars = require('./getPWAEnvVars')
const injectPrecacheManifest = require('./injectPrecacheManifest')

module.exports = {
    compileServiceWorker,
    getPWAEnvVars,
    injectPrecacheManifest,
}
