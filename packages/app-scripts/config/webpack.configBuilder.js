/* global require, module*/
const path = require('path');
const babelConfig = require('./babel.config');

const loaders = {
  babel: require.resolve('babel-loader'),
  css: require.resolve('css-loader'),
  style: require.resolve('style-loader'),
  url: require.resolve('url-loader'),
  file: require.resolve('file-loader')
}

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
    library: '',
    libraryTarget: 'commonjs',
  },
  module: {
    rules: [
      // { parser: { requireEnsure: false } },
      {
        test: /(\.jsx|\.js)$/,
        loader: loaders.babel,
        exclude: /(node_modules)/,
        options: babelConfig
      },
      {
        test: /\.css$/,
        use: [loaders.style, loaders.css],
        // Don't consider CSS imports dead code even if the
        // containing package claims to have no side effects.
        // Remove this when webpack adds a warning or an error for this.
        // See https://github.com/webpack/webpack/issues/6571
        sideEffects: true,
      },
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
        loader: loaders.file,
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
    // splitChunks: {
    //   // chunks: 'all',
    //   name: false,
    // },
  }
});

module.exports = buildConfig;