const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

const parseCustomAuthorities = authorities => {
    if (!authorities) {
        return undefined
    }
    if (
        !Array.isArray(authorities) ||
        !authorities.every(auth => typeof auth === 'string')
    ) {
        reporter.warn(
            `Invalid value ${chalk.bold(
                authorities
            )} specified for ${chalk.bold(
                'customAuthorities'
            )}, must be an array of strings, skipping.`
        )
        return undefined
    }
    return authorities
}
const parseDataStoreNamespace = namespace => {
    if (!namespace) {
        return undefined
    }
    if (typeof namespace !== 'string') {
        reporter.warn(
            `Invalid value ${chalk.bold(namespace)} specified for ${chalk.bold(
                'dataStoreNamespace'
            )}, must be a string, skipping.`
        )
        return undefined
    }

    return namespace
}
module.exports = (paths, config, publicUrl) => {
    const manifest = {
        app_hub_id: config.id,
        appType: 'APP',
        short_name: config.name,
        name: config.title,
        description: config.description,
        version: config.version,
        core_app: config.coreApp,

        launch_path: 'index.html',
        default_locale: 'en',
        activities: {
            dhis: {
                href: '*',
                namespace: parseDataStoreNamespace(config.dataStoreNamespace),
            },
        },
        authorities: parseCustomAuthorities(config.customAuthorities),
        icons: {
            48: 'dhis2-app-icon.png',
        },
        developer: config.author,

        manifest_generated_at: String(new Date()),

        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#ffffff',

        scope: publicUrl,
    }

    reporter.debug('Generated manifest', manifest)

    // For backwards compatibility, WILL BE DEPRECATED
    fs.writeJsonSync(paths.buildAppManifest, manifest, { spaces: 2 })

    // Write config json
    const appConfig = { ...config }
    delete appConfig['entryPoints']

    fs.writeJsonSync(paths.buildAppConfigJson, appConfig, { spaces: 2 })
}
