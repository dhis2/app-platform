const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')

const parseCustomAuthorities = (authorities) => {
    if (!authorities) {
        return undefined
    }
    if (
        !Array.isArray(authorities) ||
        !authorities.every((auth) => typeof auth === 'string')
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
const parseDataStoreNamespace = (namespace) => {
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
    // PWA manifest
    const manifestJson = {
        short_name: config.title,
        name: config.title,
        description: config.description,
        icons: [
            {
                src: 'android-chrome-192x192.png',
                type: 'image/png',
                sizes: '192x192',
            },
            {
                src: 'android-chrome-384x384.png',
                type: 'image/png',
                sizes: '384x384',
            },
            {
                src: 'apple-touch-icon.png',
                type: 'image/png',
                sizes: '180x180',
            },
            {
                src: 'dhis2-app-icon.png',
                type: 'image/png',
                sizes: '48x48',
            },
            {
                src: 'favicon-16x16.png',
                sizes: '16x16',
                type: 'image/png',
            },
            {
                src: 'favicon-32x32.png',
                sizes: '32x32',
                type: 'image/png',
            },
            {
                src: 'favicon-48x48.png',
                sizes: '48x48',
                type: 'image/png',
            },
            {
                src: 'favicon.ico',
                sizes: '64x64 32x32 24x24 16x16',
                type: 'image/x-icon',
            },
            {
                src: 'mstile-150x150.png',
                sizes: '150x150',
                type: 'image/png',
            },
            {
                src: 'safari-pinned-tab.svg',
                type: 'image/svg+xml',
            },
        ],
        start_url: '.',
        display: 'standalone',
        theme_color: '#ffffff',
        background_color: '#f4f6f8',
    }

    // Legacy manifest
    const manifestWebapp = {
        app_hub_id: config.id,
        appType: 'APP',
        short_name: config.name,
        name: config.title,
        description: config.description,
        version: config.version,
        core_app: config.coreApp,

        // todo: omit this for plugins without apps (LIBS-477>479)
        launch_path: paths.launchPath,
        plugin_launch_path: config.entryPoints.plugin
            ? paths.pluginLaunchPath
            : undefined,
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

    reporter.debug('Generated manifest.json', manifestJson)
    reporter.debug('Generated manifest.webapp', manifestWebapp)

    // Write PWA manifest
    fs.writeJsonSync(paths.shellPublicManifestJson, manifestJson, {
        spaces: 2,
    })
    // Legacy manifest for backwards compatibility, WILL BE DEPRECATED
    fs.writeJsonSync(paths.shellPublicManifestWebapp, manifestWebapp, {
        spaces: 2,
    })

    // Write d2 config json
    const appConfig = { ...config }
    delete appConfig['entryPoints']
    appConfig.entryPoints = {
        app: paths.launchPath,
        plugin: config.entryPoints.plugin ? paths.pluginLaunchPath : undefined,
    }
    delete appConfig['pwa']

    fs.writeJsonSync(paths.shellPublicConfigJson, appConfig, { spaces: 2 })
}
