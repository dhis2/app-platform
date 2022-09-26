// Based on CRA Webpack config

const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const WorkboxWebpackPlugin = require('workbox-webpack-plugin')
const makeBabelConfig = require('../../../config/makeBabelConfig')
const { getPWAEnvVars } = require('../pwa')
const getShellEnv = require('../shell/env')

const babelWebpackConfig = {
    babelrc: false,
    configFile: false,
    cacheDirectory: true,
    cacheCompression: false,
}

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/

module.exports = ({ env: webpackEnv, config, paths }) => {
    const isProduction = webpackEnv === 'production'
    const isDevelopment = !isProduction

    const publicPath = getPublicUrlOrPath(
        isDevelopment,
        null,
        process.env.PUBLIC_URL
    )

    const shellEnv = getShellEnv({
        plugin: 'true',
        name: config.title,
        // todo: need to make sure PWA is enabled for plugins
        ...getPWAEnvVars(config),
    })

    // "style" loader turns CSS into JS modules that inject <style> tags.
    // "css" loader resolves paths in CSS and adds assets as dependencies.
    // "postcss" loader applies autoprefixer to our CSS.
    // In production, we use MiniCSSExtractPlugin to extract that CSS to a file,
    // but in development "style" loader enables hot editing of CSS.
    const getStyleLoaders = (cssOptions) => {
        return [
            isDevelopment && require.resolve('style-loader'),
            isProduction && {
                loader: MiniCssExtractPlugin.loader,
                // css is located in `static/css`, use '../../' to locate plugin.html folder
                // in production `publicPath` can be a relative path
                options: publicPath.startsWith('.')
                    ? { publicPath: '../../' }
                    : {},
            },
            {
                loader: require.resolve('css-loader'),
                options: cssOptions,
            },
            {
                // Options for PostCSS as we reference these options twice
                // Adds vendor prefixing based on your specified browser support in
                // package.json
                loader: require.resolve('postcss-loader'),
                options: {
                    postcssOptions: {
                        // Necessary for external CSS imports to work
                        // https://github.com/facebook/create-react-app/issues/2677
                        ident: 'postcss',
                        config: false,
                        plugins: [
                            'postcss-flexbugs-fixes',
                            [
                                'postcss-preset-env',
                                {
                                    autoprefixer: {
                                        flexbox: 'no-2009',
                                    },
                                    stage: 3,
                                },
                            ],
                            // Adds PostCSS Normalize as the reset css with default options,
                            // so that it honors browserslist config in package.json
                            // which in turn let's users customize the target behavior as per their needs.
                            'postcss-normalize',
                        ],
                    },
                    sourceMap: isDevelopment,
                },
            },
        ].filter(Boolean)
    }

    return {
        mode: webpackEnv,
        bail: isProduction,
        entry: paths.shellPluginBundleEntrypoint,
        output: {
            path: paths.shellBuildOutput,
            filename: isProduction
                ? 'static/js/plugin-[name].[contenthash:8].js'
                : 'static/js/plugin.bundle.js',
            chunkFilename: isProduction
                ? 'static/js/plugin-[name].[contenthash:8].chunk.js'
                : 'static/js/plugin-[name].chunk.js',
            // ! dhis2: this at least gets fonts to match the CRA build,
            // but is re-outputting them
            assetModuleFilename: 'static/media/[name].[hash][ext]',
            // TODO: investigate dev source maps here (devtoolModuleFilenameTemplate)
        },
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        parse: {
                            // We want terser to parse ecma 8 code. However, we don't want it
                            // to apply any minification steps that turns valid ecma 5 code
                            // into invalid ecma 5 code. This is why the 'compress' and 'output'
                            // sections only apply transformations that are ecma 5 safe
                            // https://github.com/facebook/create-react-app/pull/4234
                            ecma: 8,
                        },
                        compress: {
                            ecma: 5,
                            warnings: false,
                        },
                        output: {
                            ecma: 5,
                            comments: false,
                        },
                    },
                }),
                new CssMinimizerPlugin(),
            ],
            splitChunks: {
                chunks: 'all',
            },
        },
        plugins: [
            isDevelopment && new ReactRefreshWebpackPlugin(),
            new HtmlWebpackPlugin(
                Object.assign(
                    {
                        inject: true,
                        filename: paths.pluginLaunchPath,
                        template: paths.shellPublicPluginHtml,
                    },
                    isProduction
                        ? {
                              minify: {
                                  removeComments: true,
                                  collapseWhitespace: true,
                                  removeRedundantAttributes: true,
                                  useShortDoctype: true,
                                  removeEmptyAttributes: true,
                                  removeStyleLinkTypeAttributes: true,
                                  keepClosingSlash: true,
                                  minifyJS: true,
                                  minifyCSS: true,
                                  minifyURLs: true,
                              },
                          }
                        : undefined
                )
            ),
            isProduction &&
                new MiniCssExtractPlugin({
                    filename: 'static/css/[name].[contenthash:8].css',
                    chunkFilename:
                        'static/css/[name].[contenthash:8].chunk.css',
                }),
            // Makes some environment variables available to the JS code, for example:
            // if (process.env.NODE_ENV === 'production') { ... }.
            // It is absolutely essential that NODE_ENV is set to production
            // during a production build.
            // Otherwise React will be compiled in the very slow development mode.
            new webpack.DefinePlugin({
                'process.env': {
                    ...Object.keys(shellEnv).reduce((env, key) => {
                        env[key] = JSON.stringify(shellEnv[key])
                        return env
                    }, {}),
                    NODE_ENV: JSON.stringify(webpackEnv),
                },
            }),
            new webpack.IgnorePlugin({
                resourceRegExp: /^\.\/locale$/,
                contextRegExp: /moment$/,
            }),
            // dhis2: Inject plugin static assets to the existing SW's precache manifest
            process.env.NODE_ENV === 'production' &&
                new WorkboxWebpackPlugin.InjectManifest({
                    swSrc: paths.shellBuildServiceWorker,
                    injectionPoint: 'self.__WB_PLUGIN_MANIFEST',
                    // Skip compiling the SW, which happens in the app build step
                    compileSrc: false,
                    dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
                    exclude: [
                        /\.map$/,
                        /asset-manifest\.json$/,
                        /LICENSE/,
                        // TODO dhis2: locales are weird in the plugin build -
                        // Ignore them in precache manifest for now
                        /moment-locales/,
                    ],
                    // Bump up the default maximum size (2mb) that's precached,
                    // to make lazy-loading failure scenarios less likely.
                    // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
                    maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
                }),
        ].filter(Boolean),
        module: {
            rules: [
                {
                    oneOf: [
                        {
                            test: /\.(js|mjs|jsx|ts|tsx)$/,
                            include: paths.shellSrc,
                            use: {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    ...makeBabelConfig({ mode: webpackEnv }),
                                    ...babelWebpackConfig,
                                    plugins: [
                                        ...makeBabelConfig({ mode: webpackEnv })
                                            .plugins,
                                        isDevelopment &&
                                            require.resolve(
                                                'react-refresh/babel'
                                            ),
                                    ].filter(Boolean),
                                },
                            },
                        },
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        {
                            test: /\.(js|mjs)$/,
                            exclude: /@babel(?:\/|\\{1,2})runtime/,
                            use: {
                                loader: require.resolve('babel-loader'),
                                options: {
                                    presets: [require('@babel/preset-react')],
                                    ...babelWebpackConfig,
                                },
                            },
                        },
                        {
                            test: cssRegex,
                            exclude: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: true,
                                modules: {
                                    mode: 'icss',
                                },
                            }),
                            // Don't consider CSS imports dead code even if the
                            // containing package claims to have no side effects.
                            // Remove this when webpack adds a warning or an error for this.
                            // See https://github.com/webpack/webpack/issues/6571
                            sideEffects: true,
                        },
                        {
                            test: cssModuleRegex,
                            use: getStyleLoaders({
                                importLoaders: 1,
                                sourceMap: true,
                                modules: {
                                    mode: 'local',
                                    getLocalIdent: getCSSModuleLocalIdent,
                                },
                            }),
                        },
                        // 'asset/resource' fixes fonts, but 'file-loader' breaks css modules
                        // when used for all asset types. So use each for respective files
                        {
                            test: /\.(woff|woff2|eot|ttf|otf)$/i,
                            type: 'asset/resource',
                            generator: {
                                filename: 'static/media/[name].[hash][ext]',
                            },
                        },
                        // "file" loader makes sure those assets get served by WebpackDevServer.
                        // When you `import` an asset, you get its (virtual) filename.
                        // In production, they would get copied to the `build` folder.
                        // This loader doesn't use a "test" so it will catch all modules
                        // that fall through the other loaders.
                        {
                            loader: require.resolve('file-loader'),
                            // Exclude `js` files to keep "css" loader working as it injects
                            // its runtime that would otherwise be processed through "file" loader.
                            // Also exclude `html` and `json` extensions so they get processed
                            // by webpacks internal loaders.
                            exclude: [
                                /\.(js|mjs|jsx|ts|tsx)$/,
                                /\.html$/,
                                /\.json$/,
                            ],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        // Saves some chunk size logging
        performance: false,
        // stats: 'verbose',
    }
}
