const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')

const shellAppDirname = 'src/current-d2-app'

module.exports = makePaths = (cwd = process.cwd()) => {
    const base = path.resolve(cwd)
    const paths = {
        webpackConfig: path.join(__dirname, '../../config/webpack.config.js'),
        babelConfig: path.join(__dirname, '../../config/babel.config.js'),

        shellSource: path.dirname(
            require.resolve('@dhis2/app-shell/package.json')
        ),

        base,
        package: path.join(base, './package.json'),
        config: path.join(base, './d2.config.js'),
        src: path.join(base, './src'),
        appEntry: path.join(base, './src/App.js'),
        i18nStrings: path.join(base, './i18n'),
        i18nLocales: path.join(base, './src/locales'),

        d2: path.join(base, './.d2/'),
        devOut: path.join(base, './.d2/devOut'),
        appOutputFilename: 'App.js',
        shell: path.join(base, './.d2/shell'),
        shellAppDirname,
        shellApp: path.join(base, `./.d2/shell/${shellAppDirname}`),
        shellBuildOutput: path.join(base, './.d2/shell/build'),

        buildOutput: path.join(base, './build'),
    }

    reporter.debug('PATHS', paths)

    return paths
}
