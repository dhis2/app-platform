const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

/**
 * Gets the original `entrypoints` property in d2.config.js
 * without applying defaults. Used to detect if there is actually
 * supposed to be an app entrypoint for this... app. Temporary until
 * the build process is redesigned to allow building plugins without
 * apps (LIBS-479)
 */
const getOriginalEntrypoints = (paths) => {
    try {
        if (fs.existsSync(paths.config)) {
            reporter.debug('Loading d2 config at', paths.config)
            // NB: this import can be confounded by previous object mutations
            const originalConfig = require(paths.config)
            reporter.debug('loaded', originalConfig)
            return originalConfig.entryPoints // may be undefined
        }
    } catch (e) {
        reporter.error('Failed to load d2 config!')
        reporter.error(e)
        process.exit(1)
    }
}
exports.getOriginalEntrypoints = getOriginalEntrypoints
