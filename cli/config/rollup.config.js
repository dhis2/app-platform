// rollup.config.js
const path = require('path')

const chalk = require('chalk')
const resolve = require('rollup-plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const postcss = require('rollup-plugin-postcss')
const replace = require('rollup-plugin-replace')
const visualize = require('rollup-plugin-visualizer')

const { reporter } = require('@dhis2/cli-helpers-engine')

const standardLibs = require('./standard-libs.json')

// Exclude local app-shell dependencies
Object.entries(standardLibs).forEach(([dep, version]) => {
    if (version.startsWith('file:') || version.startsWith('link:')) {
        delete standardLibs[dep]
    }
})

const bundle = ({
    entryPointName,
    entryPoint,
    outDir,
    pkg,
    mode,
    bundleDeps,
    cwd,
}) => {
    const externals = new RegExp(
        Object.keys({
            ...standardLibs,
            ...pkg.peerDependencies,
        })
            .map(name => `^${name}(/.+)?$`)
            .join('|')
    )

    const sourcemap = mode === 'production' ? true : 'inline'

    return {
        input: entryPoint,
        output: [
            {
                file: path.join(outDir, 'es', `${entryPointName}.js`),
                format: 'es',
                sourcemap,
                banner: '/* eslint-disable */',
            },
            {
                file: path.join(outDir, 'cjs', `${entryPointName}.js`),
                format: 'cjs',
                sourcemap,
                banner: '/* eslint-disable */',
            },
        ],
        external: bundleDeps
            ? id => externals.test(id)
            : id => !/^\.+\//.test(id),
        plugins: [
            replace({
                'process.env.NODE_ENV': `"${mode}"`,
            }),
            postcss({
                autoModules: false,
            }),
            json(),
            babel({
                configFile: require.resolve('./babel.config.js'),
                exclude: /node_modules/, // only transpile our source code
            }),
            resolve({
                /*
                 * TODO: Use of named exports (particularly `react-is` from `react-redux`)
                 * means we can't actually use `module` entrypoints... We could also explicitly
                 * add the CJS named exports to the `commonjs` options below, but that requires
                 * fore-knowledge of all the libraries an app/lib could depend on.
                 * See https://github.com/rollup/rollup-plugin-commonjs/issues/211#issuecomment-337897124
                 */
                mainFields: ['main'],
            }),
            commonjs({ include: /node_modules/ }),
            visualize({
                filename: path.join(outDir, 'stats.html'),
                title: 'DHIS2 Build Analysis',
                template: 'treemap',
            }),
        ],
        onwarn(warning, warn) {
            // skip certain warnings
            if (warning.code === 'UNRESOLVED_IMPORT') {
                reporter.error(
                    `Module ${chalk.bold(
                        warning.source
                    )} imported from ${chalk.bold(
                        warning.importer
                    )} could not be resolved - add it as a peerDependency if it should be treated as external`
                )
                throw new Error('Build Failed - unresolved import')
            }
        },
    }
}

module.exports = bundle
