const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
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

    const includesPlugin = Boolean(config.entryPoints.plugin)
    // If there's a plugin, there might not be an app intended to be exposed,
    // in which case omit the app launch path. Check the original d2.config
    // without added defaults to see if an app is intended.
    // If there's not a plugin, default to 'true'
    const shouldIncludeAppLaunchPath = includesPlugin
        ? Boolean(getOriginalEntrypoints(paths)?.app)
        : true

    // Legacy manifest
    const manifestWebapp = {
        app_hub_id: config.id,
        appType: 'APP',
        short_name: config.name,
        name: config.title,
        description: config.description,
        version: config.version,
        core_app: config.coreApp,

        launch_path: shouldIncludeAppLaunchPath ? paths.launchPath : undefined,
        plugin_launch_path: includesPlugin ? paths.pluginLaunchPath : undefined,
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
        app: shouldIncludeAppLaunchPath ? paths.launchPath : undefined,
        plugin: includesPlugin ? paths.pluginLaunchPath : undefined,
    }
    delete appConfig['pwa']

    fs.writeJsonSync(paths.shellPublicConfigJson, appConfig, { spaces: 2 })
}
