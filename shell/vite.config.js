import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'

// Matches locale file and captures locale identifier in the filename
const momentLocaleRegex = /moment\/dist\/locale\/(.*)\.js$/

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // https://vitejs.dev/config/#using-environment-variables-in-config
    const env = loadEnv(mode, process.cwd(), ['REACT_APP', 'NODE_ENV'])

    // WIP
    // Use individual properties for drop-in replacements instead of a whole
    // object, which allows for better code trimming optimizations
    const defineOptions = {}
    Object.entries(env).forEach(([key, val]) => {
        defineOptions[`process.env.${key}`] = JSON.stringify(val)
    })
    console.log({ env, defineOptions })

    return {
        plugins: [
            // Allow JSX in JS files pt. 1
            {
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
            },
            /**
             * Allows the dynamic import of `moment/dist/locale/${locale}`
             * in /adapter/src/utils/localeUtils.js.
             * Also works for other bare packages; approximates behavior of
             * inline `webpackChunkName` usage.
             * Third-party plugin
             */
            dynamicImport(),
            react({
                babel: {
                    plugins: ['styled-jsx/babel'],
                },
            }),
        ],

        // By default, assets are resolved to the root of the domain ('/'), but
        // deployed apps aren't served from there.
        // This option is basically the same as PUBLIC_URL for CRA and Parcel.
        // Works for both dev and production.
        base: './',

        // Change default ENV prefix from VITE_ to be backward compatible with CRA
        // https://vitejs.dev/config/shared-options.html#envprefix
        envPrefix: 'REACT_APP',

        // Need to add vars on process.env here -- drop-in replacement
        define: defineOptions,

        build: {
            outDir: 'build',
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    // Build an optional plugin -- shares code with main app
                    // TODO: Dynamically build a plugin, based on context
                    // plugin: resolve(__dirname, 'plugin.html'),
                },
                output: {
                    manualChunks: (id) => {
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
                    },
                },
            },
        },

        // Allow JSX in JS files pt. 2
        optimizeDeps: {
            force: true,
            esbuildOptions: {
                loader: {
                    '.js': 'jsx',
                },
            },
        },
    }
})
