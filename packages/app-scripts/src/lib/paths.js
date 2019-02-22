const path = require('path')

const shellAppDirname = 'src/current-d2-app'

module.exports = makePaths = cwd => ({
    webpackConfig: path.join(__dirname, '../../config/webpack.config.js'),
    babelConfig: path.join(__dirname, '../../config/babel.config.js'),

    shellSource: path.dirname(require.resolve('@dhis2/app-shell/package.json')),

    base: path.join(cwd, './'),
    package: path.join(cwd, './package.json'),
    src: path.join(cwd, './src'),
    appEntry: path.join(cwd, './src/App.js'),
    i18nStrings: path.join(cwd, './i18n'),
    i18nLocales: path.join(cwd, './src/locales'),

    d2: path.join(cwd, './.d2/'),
    devOut: path.join(cwd, './.d2/devOut'),
    appOutputFilename: 'App.js',
    shell: path.join(cwd, './.d2/shell'),
    shellAppDirname,
    shellApp: path.join(cwd, `./.d2/shell/${shellAppDirname}`),
    shellBuildOutput: path.join(cwd, './.d2/shell/build'),

    config: path.join(cwd, './d2.config.js'),
    buildOutput: path.join(cwd, './build'),
})
