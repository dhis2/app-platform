import commonjs from '@rollup/plugin-commonjs'
import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'
import json from '@rollup/plugin-json'
import nodeResolve from '@rollup/plugin-node-resolve'
import url from '@rollup/plugin-url'
import inputSourcemaps from 'rollup-plugin-sourcemaps'
import { configureOutput } from './helpers/configureOutput.js'
import { parseRollupEnvironment } from './helpers/parseRollupEnvironment.js'
import babel from './plugins/babel.js'
import postcss from './plugins/postcss.js'
import replace from './plugins/replace.js'

export const configFactory = commandLineArgs => {
    commandLineArgs.environment = commandLineArgs.environment || {}

    const env = parseRollupEnvironment(commandLineArgs.environment)

    const input = commandLineArgs.input
    const dir = commandLineArgs.dir
    const format = commandLineArgs.format
    const globals = commandLineArgs.globals // umd modules
    const external = commandLineArgs.external // all modules

    const mode = env.MODE || process.env.NODE_ENV || 'development'
    const publicPath = env.PUBLIC_PATH || process.env.PUBLIC_PATH || '.'

    delete commandLineArgs.input
    delete commandLineArgs.format
    delete commandLineArgs.dir
    delete commandLineArgs.globals
    delete commandLineArgs.external

    if (!input || !dir) {
        throw new Error('Input and dir must be defined')
    }
    const name =
        typeof input === 'string'
            ? input
            : Array.isArray(input)
            ? input[0]
            : Object.keys(input)[0]

    return {
        input,
        output: configureOutput({ name, dir, mode, globals, format }),
        plugins: [
            // Dependency resolution
            nodeResolve({
                mainFields: ['browser', 'module', 'main'],
                preferBuiltins: false,
            }),
            inputSourcemaps({ include: /node_modules/ }), // TODO: Confirm that this works...

            // Asset loading
            json(),
            postcss({ mode }),
            url({ publicPath }),

            // Code transformation
            replace({ mode }),
            commonjs({
                include: /node_modules/,
            }),
            babel({ mode }),
            dynamicImportVars({
                warnOnError: true,
            }),

            // TODO: compile-time eslint
            // TODO: build errors as served html
            // TODO: incremental builds & dev-server HMR
        ],
        external,
    }
}

export default configFactory
