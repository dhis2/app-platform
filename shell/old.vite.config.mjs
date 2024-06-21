import { resolve } from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv, transformWithEsbuild } from 'vite'
import dynamicImport from 'vite-plugin-dynamic-import'

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

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
    // https://vitejs.dev/config/#using-environment-variables-in-config
    const env = loadEnv(mode, process.cwd(), ['DHIS2_', 'REACT_APP_', 'NODE_ENV', 'PORT'])

    // Setting up process.env replacements for backwards compatibility:
    // Use individual properties for drop-in replacements instead of a whole
    // object, which allows for better dead code elimination
    const defineOptions = {}
    Object.entries(env)
        // Don't expose "just DHIS2"-prefixed env vars on process.env
        .filter(([key]) => !key.startsWith('DHIS2_'))
        .forEach(([key, val]) => {
        defineOptions[`process.env.${key}`] = JSON.stringify(val)
    })

    return {
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

        // For backwards compatibility, add REACT_APP_DHIS2_... env vars
        // to process.env. They will be statically replaced at build time
        // This will be removed in future versions
        // todo: deprecate in favor of import.meta.env
        define: defineOptions,

        // Start the server at 3000 or a configured port
        server: { port: env.PORT || 3000 },

        build: {
            outDir: 'build',
            rollupOptions: {
                input: {
                    main: resolve(__dirname, 'index.html'),
                    // TODO: Dynamically build a plugin, based on context
                    // plugin: resolve(__dirname, 'plugin.html'),
                },
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
    }
})
