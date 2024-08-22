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

module.exports = (cwd = process.cwd(), { typeScript } = {}) => {
    const base = path.resolve(cwd)
    const rootDirectory = path.parse(cwd).root
    const initFolder = typeScript ? 'init-typescript' : 'init'
    const extension = typeScript ? 'ts' : 'js'

    const paths = {
        initAppModuleCss: path.join(
            __dirname,
            `../../config/templates/common/App.module.css`
        ),
        initAppTestJsx: path.join(
            __dirname,
            `../../config/templates/${initFolder}/App.test.${extension}x`
        ),
        initConfigApp: path.join(
            __dirname,
            `../../config/templates/${initFolder}/d2.config.app.${extension}`
        ),
        initConfigLib: path.join(
            __dirname,
            `../../config/templates/${initFolder}/d2.config.lib.${extension}`
        ),
        initEntrypoint: path.join(
            __dirname,
            `../../config/templates/${initFolder}/entrypoint.${extension}x`
        ),
        initPackageJson: path.join(
            __dirname,
            `../../config/templates/common/package.json`
        ),
        initReadme: path.join(
            __dirname,
            `../../config/templates/common/README.md`
        ),

        initTSConfig: path.join(
            __dirname,
            `../../config/templates/init-typescript/tsconfig.json`
        ),

        initEslint: path.join(
            __dirname,
            `../../config/templates/init-typescript/eslint.config.js`
        ),
        initGlobalDeclaration: path.join(
            __dirname,
            '../../config/templates/init-typescript/global.d.ts'
        ),
        initModulesDeclaration: path.join(
            __dirname,
            '../../config/templates/init-typescript/modules.d.ts'
        ),
        configDefaults: path.join(
            __dirname,
            typeScript
                ? '../../config/d2ConfigDefaults.typescript.js'
                : '../../config/d2ConfigDefaults.js'
        ),
        babelConfig: path.join(__dirname, '../../config/babel.config.js'),
        jestConfigDefaults: path.join(__dirname, '../../config/jest.config.js'), // TODO: probably need a different jest.config for TS

        shellSource,
        shellSourceEntrypoint: path.join(shellSource, `src/App.jsx`), // TODO: double check the effect of having TS in shell folder
        shellSourcePublic: path.join(shellSource, 'public'),

        // destination paths where we copy files to
        base,
        package: path.join(base, './package.json'),
        yarnLock: findYarnLock(base, rootDirectory),
        dotenv: path.join(base, './.env'),
        config: path.join(base, `./d2.config.js`), // TODO: double check this works
        readme: path.join(base, './README.md'),
        src: path.join(base, './src'),
        public: path.join(base, './public'),
        jestConfig: path.join(base, 'jest.config.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),
        tsConfig: path.join(base, './tsconfig.json'),
        eslintConfig: path.join(base, './eslint.config.js'),

        d2: path.join(base, './.d2/'),
        appOutputFilename: 'App.jsx',
        shell: path.join(base, './.d2/shell'),
        shellSrc: path.join(base, './.d2/shell/src'),
        shellAppEntrypoint: path.join(base, `./.d2/shell/src/App.jsx`),
        shellAppDirname,
        shellApp: path.join(base, `./.d2/shell/${shellAppDirname}`),
        shellIndexHtml: path.join(base, './.d2/shell/index.html'),
        shellPluginHtml: path.join(base, './.d2/shell/plugin.html'),
        shellPluginBundleEntrypoint: path.join(
            base,
            `./.d2/shell/src/plugin.index.${extension}x`
        ),
        shellPluginEntrypoint: path.join(
            base,
            `./.d2/shell/src/Plugin.${extension}x`
        ),
        // TODO: look at what to do with service-worker files whether to move to TS or not
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
