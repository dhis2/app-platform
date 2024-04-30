import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'

// Matches locale file and captures locale identifier in the filename
const momentLocaleRegex = /moment\/dist\/locale\/(.*)\.js$/

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
 */
const jsxInJSPlugin = {
    name: 'treat-js-files-as-jsx',
    async transform(code, id) {
        if (!id.match(/src\/.*\.js$/)) {
            return null
        }
        // Use the exposed transform from vite, instead of directly
        // transforming with esbuild
        return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
        })
    },
}

const handleManualChunks = (id) => {
    // Assign moment locale chunks into their own dir.
    // Ends up e.g. /assets/moment-locales/pt-br-[hash].js
    const match = id.match(momentLocaleRegex)
    if (match) {
        return `moment-locales/${match[1]}`
    }
    // Separate moment itself out,
    // otherwise it gets chunked with a locale
    if (id.endsWith('moment/dist/moment.js')) {
        return 'moment'
    }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // Set up env vars to support consumers of existing REACT_APP_DHIS2_APP_
    // env vars:
    // https://vitejs.dev/config/#using-environment-variables-in-config
    const env = loadEnv(mode, process.cwd(), ['REACT_APP', 'NODE_ENV'])
    // Use individual properties for drop-in replacements instead of a whole
    // object, which allows for better code trimming optimizations
    const defineOptions = {}
    Object.entries(env).forEach(([key, val]) => {
        defineOptions[`process.env.${key}`] = JSON.stringify(val)
    })

    return {
        // By default, assets are resolved to the root of the domain ('/'), but
        // deployed apps aren't served from there.
        // This option is basically the same as PUBLIC_URL for CRA and Parcel.
        // Works for both dev and production.
        base: './',

        // Change default ENV prefix from VITE_ to be backward compatible with
        // CRA -- this populates things like %REACT_APP_...% in index.html
        // https://vitejs.dev/config/shared-options.html#envprefix
        envPrefix: 'REACT_APP',

        // Need to add vars on process.env here -- drop-in replacement
        // (adding env vars to import.meta is the default for vite)
        define: defineOptions,

        build: {
            outDir: 'build',
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    // TODO: Dynamically build a plugin, based on context
                    // plugin: resolve(__dirname, 'plugin.html'),
                },
                output: { manualChunks: handleManualChunks },
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
    }
})
