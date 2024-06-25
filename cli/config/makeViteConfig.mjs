import react from '@vitejs/plugin-react'
import { defineConfig, transformWithEsbuild } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'

// This file is used to create config to use with the Vite Node API
// (i.e. vite.createServer() and vite.build())
// It uses ESM format and has an .mjs extension, since the CJS build of
// Vite's Node API is deprecated and will be removed in v6
// https://vitejs.dev/guide/troubleshooting.html#vite-cjs-node-api-deprecated

/**
 * Allows JSX in .js files:
 * Vite normally throws an error when JSX syntax is used in a file without a
 * .jsx or .tsx extension. This is by design, in order to improve transform
 * performance by not parsing JS files for JSX.
 * This plugin is 1 of 2 config options that allow JSX to be used in
 * .js or .ts files -- the options in `optimizeDeps` below are part 2.
 *
 * NB: State-preserving HMR will not work on React components unless they have
 * a .jsx or .tsx extension though, unfortunately
 *
 * todo: deprecate
 */
const jsxInJSPlugin = {
    name: 'treat-js-files-as-jsx',
    async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
            return null
        }
        // todo: consider JSX warning if </ or />
        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
        })
    },
}

const momentLocaleRegex = /moment\/dist\/locale\/(.*)\.js$/
/**
 * Configure chunk output a bit to make a tidier build folder:
 * Assign moment locale chunks into their own dir
 * (they are already individually split out due to the dynamic import
 * in localeUtils.js in the adapter)
 */
const handleChunkFileNames = (info) => {
    const { facadeModuleId } = info // This id is the module's filepath
    return momentLocaleRegex.test(facadeModuleId)
        ? 'assets/moment-locales/[name]-[hash].js'
        : 'assets/[name]-[hash].js' // the Rollup default
}

const fontRegex = /\.woff2?/
/** Tidy up fonts in the build/assets folder */
const handleAssetFileNames = ({ name }) => {
    return fontRegex.test(name)
        ? 'assets/fonts/[name]-[hash][extname]'
        : 'assets/[name]-[hash][extname]' // the Rollup default
}

/**
 * Setting up static variable replacements at build time.
 * Use individual properties for drop-in replacements instead of a whole
 * object, which allows for better dead code elimination.
 * For env vars for now, we keep the behavior in /src/lib/shell/env.js:
 * loading, filtering, and prefixing env vars for CRA.
 * Once we remove support for those variables, we just need:
 * 1. the Shell env vars, e.g. DHIS2_APP_NAME, -_VERSION, etc. This need to
 * be added to the env by the `define` configuration below
 * 2. the user's env, which can be loaded and filtered by Vite's
 * `vite.loadEnv(mode, process.cwd(), ['DHIS2_'])`,
 * and don't need to use `define`; they just need the envPrefix config.
 */
const getDefineOptions = (env) => {
    const defineOptions = {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
    }
    Object.entries(env).forEach(([key, val]) => {
        // 'DHIS2_'-prefixed vars go on import.meta.env
        if (key.startsWith('DHIS2_')) {
            defineOptions[`import.meta.env.${key}`] = JSON.stringify(val)
            return
        }
        // For backwards compatibility, add REACT_APP_DHIS2_... and other env
        // vars to process.env. They will be statically replaced at build time.
        // This will be removed in future versions
        // todo: deprecate in favor of import.meta.env
        defineOptions[`process.env.${key}`] = JSON.stringify(val)
    })
    return defineOptions
}

const getBuildInputs = (config, paths) => {
    // todo: adapt for 1) no app, and 2) multiple plugins
    const inputs = { main: paths.shellIndexHtml }
    if (config.entryPoints.plugin) {
        inputs.plugin = paths.shellPluginHtml
    }
    return inputs
}

// https://vitejs.dev/config/
export default ({ paths, config, env }) => {
    return defineConfig({
        // Need to specify the location of the app root, since we're not using
        // the Vite CLI from the app root
        root: paths.shell,

        // By default, assets are resolved to the root of the domain ('/'), but
        // deployed apps aren't served from there.
        // This option is basically the same as PUBLIC_URL for CRA and Parcel.
        // Works for both dev and production.
        base: './',

        // Expose env vars with DHIS2_ prefix in index.html and on
        // import.meta.env -- process.env.REACT_APP_DHIS2_... variables should
        // migrate to the import.meta.env format
        // https://vitejs.dev/config/shared-options.html#envprefix
        envPrefix: 'DHIS2_',

        // Static replacement of vars at build time
        define: getDefineOptions(env),

        build: {
            outDir: 'build',
            rollupOptions: {
                input: getBuildInputs(config, paths),
                output: {
                    chunkFileNames: handleChunkFileNames,
                    assetFileNames: handleAssetFileNames,
                },
            },
        },

        plugins: [
            // Allow JSX in .js files pt. 1
            jsxInJSPlugin,
            /**
             * Allows the dynamic import of `moment/dist/locale/${locale}`
             * in /adapter/src/utils/localeUtils.js.
             * Also works for other "bare" packages; approximates behavior of
             * inline `webpackChunkName` usage. Third-party plugin.
             */
            dynamicImport(),
            react({ babel: { plugins: ['styled-jsx/babel'] } }),
        ],

        // Allow JSX in .js pt. 2
        optimizeDeps: {
            force: true,
            esbuildOptions: { loader: { '.js': 'jsx' } },
        },
    })
}
