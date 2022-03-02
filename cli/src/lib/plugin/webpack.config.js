// Based on CRA Webpack config

// TODO: react fast refresh in development

const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')
const getPublicUrlOrPath = require('react-dev-utils/getPublicUrlOrPath')
const TerserPlugin = require('terser-webpack-plugin')
const webpack = require('webpack')
const makeBabelConfig = require('../../../config/makeBabelConfig')
const getShellEnv = require('../shell/env')

const babelWebpackConfig = {
    babelrc: false,
    configFile: false,
    cacheDirectory: true,
    cacheCompression: false,
}

const cssRegex = /\.css$/
const cssModuleRegex = /\.module\.css$/

module.exports = ({ env: webpackEnv, paths }) => {
    const isProduction = webpackEnv === 'production'
    const isDevelopment = !isProduction

    const publicPath = getPublicUrlOrPath(
        isDevelopment,
        null,
        process.env.PUBLIC_URL
    )

    const shellEnv = getShellEnv({})

    // "style" loader turns CSS into JS modules that inject <style> tags.
    // "css" loader resolves paths in CSS and adds assets as dependencies.
    // "postcss" loader applies autoprefixer to our CSS.
    // In production, we use MiniCSSExtractPlugin to extract that CSS to a file,
    // but in development "style" loader enables hot editing of CSS.
    const getStyleLoaders = cssOptions => {
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
                    // Necessary for external CSS imports to work
                    // https://github.com/facebook/create-react-app/issues/2677
                    ident: 'postcss',
                    plugins: () => [
                        require('postcss-flexbugs-fixes'),
                        require('postcss-preset-env')({
                            autoprefixer: {
                                flexbox: 'no-2009',
                            },
                            stage: 3,
                        }),
                    ],
                    sourceMap: true,
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
            new HtmlWebpackPlugin(
                Object.assign(
                    {
                        inject: true,
                        filename: 'plugin.html',
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
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
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
                                    getLocalIdent: getCSSModuleLocalIdent,
                                },
                            }),
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
    }
}
