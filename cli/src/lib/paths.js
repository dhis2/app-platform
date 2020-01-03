const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

const shellSource = path.dirname(
    require.resolve('@dhis2/app-shell/package.json')
)
const shellAppDirname = 'src/D2App'

module.exports = (cwd = process.cwd()) => {
    const base = path.resolve(cwd)
    const paths = {
        babelConfig: path.join(__dirname, '../../config/babel.config.js'),
        configDefaultsApp: path.join(
            __dirname,
            '../../config/d2.config.app.js'
        ),
        configDefaultsLib: path.join(
            __dirname,
            '../../config/d2.config.lib.js'
        ),
        jestConfigDefaults: path.join(__dirname, '../../config/jest.config.js'),

        shellSource,
        shellSourceEntrypoint: path.join(shellSource, 'src/App.js'),
        shellSourcePublic: path.join(shellSource, 'public'),

        base,
        package: path.join(base, './package.json'),
        dotenv: path.join(base, './.env'),
        config: path.join(base, './d2.config.js'),
        src: path.join(base, './src'),
        public: path.join(base, './public'),
        jestConfig: path.join(base, 'jest.config.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),

        d2: path.join(base, './.d2/'),
        devOut: path.join(base, './.d2/devOut'),
        appOutputFilename: 'App.js',
        shell: path.join(base, './.d2/shell'),
        shellAppEntrypoint: path.join(base, './.d2/shell/src/App.js'),
        shellAppDirname,
        shellApp: path.join(base, `./.d2/shell/${shellAppDirname}`),
        shellPublic: path.join(base, './.d2/shell/public'),
        shellBuildOutput: path.join(base, './.d2/shell/build'),

        buildOutput: path.join(base, './build'),
        buildAppOutput: path.join(base, './build/app'),
        buildAppManifest: path.join(base, './build/app/manifest.webapp'),
        buildAppBundle: path.join(
            base,
            './build/bundle/dhis2-{{name}}-{{version}}.zip'
        ),
    }

    reporter.debug('PATHS', paths)

    return paths
}
