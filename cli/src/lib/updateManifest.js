const { reporter, exit } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

module.exports = ({ version }, paths) => {
    const hasConfig = fs.existsSync(paths.buildAppConfigJson)
    const hasManifest = fs.existsSync(paths.buildAppManifest)

    if (!hasConfig || !hasManifest) {
        exit(
            1,
            `Could not find manifest (exists: ${hasManifest}) and/or config (exists: ${hasConfig}) in build dir. Did you forget to build?`
        )
    }

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
