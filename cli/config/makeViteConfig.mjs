import { reporter } from '@dhis2/cli-helpers-engine'
import react from '@vitejs/plugin-react'
import {
    defineConfig,
    mergeConfig,
    searchForWorkspaceRoot,
    transformWithEsbuild,
    loadConfigFromFile,
} from 'vite'
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
 *
 * This plugin and the `optimizeDeps` options in this config object,
 * along with the `jsxRuntime: 'classic'` option in the React plugin of the main
 * config, can enable support for JSX in .js files. This config object is
 * merged with the main config if the `--allowJsxInJs` flag is passed
 * to the CLI
 *
 * ! deprecated -- this config has a performance cost, especially on startup
 */
const jsxInJsConfig = {
    plugins: [
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
    ],
    optimizeDeps: {
        force: true,
        esbuildOptions: { loader: { '.js': 'jsx' } },
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
 * Vite adds env vars (from .env files, user env, and CLI args) to
 * `import.meta.env`; for backwards compatibility and generalization, we also
 * add those to `process.env`.
 *
 * Note that variables added to `import.meta.env` here will be available in
 * index.html, e.g. import.meta.env.DHIS2_APP_NAME will populate
 * %DHIS2_APP_NAME% in HTML
 *
 * Uses individual properties for drop-in replacements instead of a whole
 * object, which allows for better dead code elimination.
 *
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
    const defineOptions = {}
    Object.entries(env).forEach(([key, val]) => {
        // Each `val` should be a string already, but we need to stringify again
        // for it to appear as a string in the resulting code:
        // '"value"' here => 'value' in the code
        const stringifiedVal = JSON.stringify(val)

        defineOptions[`process.env.${key}`] = stringifiedVal
        // 'DHIS2_'-prefixed vars go on import.meta.env too
        if (key.startsWith('DHIS2_')) {
            defineOptions[`import.meta.env.${key}`] = stringifiedVal
        }
    })
    return defineOptions
}

const getBuildInputs = (config, paths) => {
    const inputs = {}
    if (config.entryPoints.app) {
        inputs.main = paths.shellIndexHtml
    }
    if (config.entryPoints.plugin) {
        inputs.plugin = paths.shellPluginHtml
    }
    return inputs
}

/** @typedef {import('../src/index').D2Config} D2Config */
/** @param {D2Config} config */
/** @param {'development' | 'production'} mode */
const resolveExtraViteConfig = async (config, mode) => {
    const { viteConfigExtensions } = config

    // If it's a string, it should be a path -- import config from there
    if (typeof viteConfigExtensions === 'string') {
        // The ConfigEnv is not normally granted when using Vite's
        // JavaScript API, so recreate those values here:
        const configEnv = {
            mode: mode,
            command: mode === 'production' ? 'build' : 'serve',
            isSsrBuild: false,
            isPreview: false,
        }
        const { config: configFromFile } = await loadConfigFromFile(
            configEnv,
            viteConfigExtensions
        )
        return configFromFile
    }

    // Otherwise, it should be an object that's ready to go
    return viteConfigExtensions
}

// https://vitejs.dev/config/
/**
 * @param {{
 *   paths: any;
 *   config: D2Config;
 *   env: any;
 *   mode: 'development' | 'production';
 *   host?: string;
 *   force?: boolean;
 *   allowJsxInJs?: boolean;
 * }} options
 */
export default async ({
    paths,
    config,
    env,
    mode,
    host,
    force,
    allowJsxInJs,
}) => {
    const baseConfig = defineConfig({
        // Need to specify the location of the app root, since this CLI command
        // gets run in a different directory than the bootstrapped app
        root: paths.shell,

        // By default, assets are resolved to the root of the domain ('/'), but
        // deployed apps aren't served from there.
        // This option is basically the same as PUBLIC_URL for CRA and Parcel.
        // Works for both dev and production.
        // Gets applied to import.meta.env.BASE_URL in the runtime code
        base: './',

        // Expose env vars with DHIS2_ prefix in index.html and on
        // import.meta.env -- process.env.REACT_APP_DHIS2_... variables should
        // migrate to the import.meta.env format
        // https://vitejs.dev/config/shared-options.html#envprefix
        envPrefix: 'DHIS2_',

        // Static replacement of vars at build time
        define: getDefineOptions(env),

        server: {
            host,
            // By default, Vite allows serving files from a workspace root or
            // falls back to the app root. Since we run the app in .d2/shell/,
            // if the app is not in a workspace, files in cwd/node_modules can
            // be out of reach (like fonts, which don't get bundled).
            // Start the workspace search from cwd so it falls back to that
            // when not in a workspace; then fonts in node_modules are usable
            // https://vitejs.dev/config/server-options.html#server-fs-allow
            fs: { allow: [searchForWorkspaceRoot(process.cwd())] },
        },

        build: {
            outDir: 'build',
            sourcemap: true,
            rollupOptions: {
                input: getBuildInputs(config, paths),
                output: {
                    chunkFileNames: handleChunkFileNames,
                    assetFileNames: handleAssetFileNames,
                },
            },
        },

        plugins: [
            /**
             * Allows the dynamic import of `moment/dist/locale/${locale}`
             * in /adapter/src/utils/localeUtils.js.
             * Also works for other "bare" packages; approximates behavior of
             * inline `webpackChunkName` usage. Third-party plugin.
             */
            dynamicImport(),
            react({
                babel: { plugins: ['styled-jsx/babel'] },
                // ! deprecated with other jsx-in-js config
                // This option allows HMR of JSX-in-JS files,
                // but it isn't possible to add with merge config:
                jsxRuntime: allowJsxInJs ? 'classic' : 'automatic',
            }),
        ],

        optimizeDeps: { force },
    })

    // Add config if "JSX in .js files" support is needed
    const appPlatformConfig = allowJsxInJs
        ? mergeConfig(baseConfig, jsxInJsConfig)
        : baseConfig

    let finalConfig = appPlatformConfig
    // If user defined extra Vite config, apply that
    if (config.viteConfigExtensions) {
        const extraConfig = await resolveExtraViteConfig(config, mode)
        finalConfig = mergeConfig(appPlatformConfig, extraConfig)
    }

    reporter.debug('Final Vite config:', finalConfig)
    return finalConfig
}
