const fs = require('fs')
const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

const shellSource = path.dirname(
    require.resolve('@dhis2/app-shell/package.json')
)
const shellAppDirname = 'src/D2App'

const findYarnLock = (base, rootDirectory) => {
    if (base === rootDirectory) {
        return null
    }
    const yarnLock = path.join(base, './yarn.lock')
    if (fs.existsSync(yarnLock)) {
        return yarnLock
    }
    return findYarnLock(path.dirname(base), rootDirectory)
}

module.exports = (cwd = process.cwd()) => {
    const base = path.resolve(cwd)
    const rootDirectory = path.parse(cwd).root
    const paths = {
        initAppModuleCss: path.join(
            __dirname,
            '../../config/init/App.module.css'
        ),
        initAppTestJsx: path.join(__dirname, '../../config/init/App.test.jsx'),
        initConfigApp: path.join(
            __dirname,
            '../../config/init/d2.config.app.js'
        ),
        initConfigLib: path.join(
            __dirname,
            '../../config/init/d2.config.lib.js'
        ),
        initEntrypoint: path.join(
            __dirname,
            '../../config/init/entrypoint.jsx'
        ),
        initPackageJson: path.join(__dirname, '../../config/init/package.json'),
        initReadme: path.join(__dirname, '../../config/init/README.md'),

        configDefaults: path.join(
            __dirname,
            '../../config/d2ConfigDefaults.js'
        ),
        babelConfig: path.join(__dirname, '../../config/babel.config.js'),
        jestConfigDefaults: path.join(__dirname, '../../config/jest.config.js'),

        shellSource,
        shellSourceEntrypoint: path.join(shellSource, 'src/App.jsx'),
        shellSourcePublic: path.join(shellSource, 'public'),

        base,
        package: path.join(base, './package.json'),
        yarnLock: findYarnLock(base, rootDirectory),
        dotenv: path.join(base, './.env'),
        config: path.join(base, './d2.config.js'),
        readme: path.join(base, './README.md'),
        src: path.join(base, './src'),
        public: path.join(base, './public'),
        jestConfig: path.join(base, 'jest.config.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),

        d2: path.join(base, './.d2/'),
        appOutputFilename: 'App.jsx',
        shell: path.join(base, './.d2/shell'),
        shellSrc: path.join(base, './.d2/shell/src'),
        shellAppEntrypoint: path.join(base, './.d2/shell/src/App.jsx'),
        shellAppDirname,
        shellApp: path.join(base, `./.d2/shell/${shellAppDirname}`),
        shellIndexHtml: path.join(base, './.d2/shell/index.html'),
        shellPluginHtml: path.join(base, './.d2/shell/plugin.html'),
        shellPluginBundleEntrypoint: path.join(
            base,
            './.d2/shell/src/plugin.index.jsx'
        ),
        shellPluginEntrypoint: path.join(base, './.d2/shell/src/Plugin.jsx'),
        shellSrcServiceWorker: path.join(
            base,
            './.d2/shell/src/service-worker.js'
        ),
        shellPublic: path.join(base, './.d2/shell/public'),
        shellPublicServiceWorker: path.join(
            base,
            './.d2/shell/public/service-worker.js'
        ),
        shellPublicManifestWebapp: path.join(
            base,
            './.d2/shell/public/manifest.webapp'
        ),
        shellPublicManifestJson: path.join(
            base,
            './.d2/shell/public/manifest.json'
        ),
        shellPublicConfigJson: path.join(
            base,
            './.d2/shell/public/d2.config.json'
        ),
        shellBuildOutput: path.join(base, './.d2/shell/build'),
        shellBuildServiceWorker: path.join(
            base,
            './.d2/shell/build/service-worker.js'
        ),

        buildOutput: path.join(base, './build'),
        buildAppOutput: path.join(base, './build/app'),
        buildAppManifest: path.join(base, './build/app/manifest.webapp'),
        buildAppConfigJson: path.join(base, './build/app/d2.config.json'),
        buildAppBundleFile: '{name}-{version}.zip',
        buildAppBundleOutput: path.join(base, 'build', 'bundle'),
        buildAppBundle: path.join(
            base,
            'build',
            'bundle',
            '{name}-{version}.zip'
        ),
        buildLibBundleFile: '{name}-{version}.zip',
        buildLibBundleOutput: path.join(base),

        launchPath: 'index.html',
        pluginLaunchPath: 'plugin.html',
    }

    reporter.debug('PATHS', paths)

    return paths
}
