const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

module.exports = ({ version }, paths) => {
    const manifest = fs.readJsonSync(paths.buildAppManifest)
    const config = fs.readJsonSync(paths.buildAppConfigJson)

    reporter.debug('Loaded manifest', manifest)
    reporter.debug('Loaded config', config)

    // set the new version after preparing for release
    manifest.version = version
    config.version = version

    reporter.debug('Updated manifest', manifest)
    reporter.debug('Updated config', config)

    // For backwards compatibility, WILL BE DEPRECATED
    fs.writeJsonSync(paths.buildAppManifest, manifest, { spaces: 2 })

    // Write config json
    fs.writeJsonSync(paths.buildAppConfigJson, config, { spaces: 2 })
}
