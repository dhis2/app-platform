
/* global require, module*/
const path = require('path');
const babelConfig = require('./babel.config');
const { cssRegex, sassRegex, sassModuleRegex, cssModuleRegex, getStyleLoaders } = require('./styleLoaders.js')
const getCSSModuleLocalIdent = require('react-dev-utils/getCSSModuleLocalIdent')

const externals = {
  react: {
    commonjs: 'react',
    commonjs2: 'react',
    umd: 'react',
    amd: 'react',
  }
};

const buildConfig = ({ name, mode, entry, outputDir, outputFilename}) => ({
  mode: mode,
  entry: entry,
  devtool: 'inline-source-map',
  externals,
  output: {
    path: outputDir,
    filename: outputFilename,
    library: name,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  module: {
    rules: [
      { parser: { requireEnsure: false } },
      {
        test: /(\.jsx|\.js)$/,
        loader: require.resolve('babel-loader'),
        exclude: /(node_modules)/,
        options: babelConfig
      },
      // "postcss" loader applies autoprefixer to our CSS.
      // "css" loader resolves paths in CSS and adds assets as dependencies.
      // `MiniCSSExtractPlugin` extracts styles into CSS
      // files. If you use code splitting, async bundles will have their own separate CSS chunk file.
      // By default we support CSS Modules with the extension .module.css
      {
        test: cssRegex,
        loader: require.resolve('css-loader'),
        // Don't consider CSS imports dead code even if the
        // containing package claims to have no side effects.
        // Remove this when webpack adds a warning or an error for this.
        // See https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
      // // Adds support for CSS Modules (https://github.com/css-modules/css-modules)
      // // using the extension .module.css
      // {
      //   test: cssModuleRegex,
      //   loader: getStyleLoaders({
      //     importLoaders: 1,
      //     sourceMap: true,
      //     modules: true,
      //     getLocalIdent: getCSSModuleLocalIdent,
      //   }),
      // },
      // "file" loader makes sure those assets get served by WebpackDevServer.
      // When you `import` an asset, you get its (virtual) filename.
      // In production, they would get copied to the `build` folder.
      // This loader doesn't use a "test" so it will catch all modules
      // that fall through the other loaders.
      {
        // Exclude `js` files to keep "css" loader working as it injects
        // its runtime that would otherwise be processed through "file" loader.
        // Also exclude `html` and `json` extensions so they get processed
        // by webpacks internal loaders.
        exclude: [
          /\.(js|mjs|jsx|ts|tsx)$/,
          /\.html$/,
          /\.json$/,
        ],
        loader: require.resolve('file-loader'),
        options: {
          name: 'static/media/[name].[hash:8].[ext]',
        },
      },
    ]
  },
  resolve: {
    modules: [path.resolve('./node_modules'), path.resolve('../../node_modules'), path.resolve('./src')],
    extensions: ['.json', '.js']
  },
  optimization: {
    // runtimeChunk: 'single',
    splitChunks: {
      chunks: 'all',
      name: false,
    },
  }
});

module.exports = buildConfig;