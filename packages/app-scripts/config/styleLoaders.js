const MiniCssExtractPlugin = require('mini-css-extract-plugin')

// style files regexes
module.exports.cssRegex = /\.css$/
module.exports.cssModuleRegex = /\.module\.css$/
module.exports.sassRegex = /\.(scss|sass)$/
module.exports.sassModuleRegex = /\.module\.(scss|sass)$/

// common function to get style loaders
module.exports.getStyleLoaders = (cssOptions, preProcessor) => {
  const loaders = [
    {
      loader: MiniCssExtractPlugin.loader,
      options: Object.assign(
        {},
        false //shouldUseRelativeAssetPaths
          ? { publicPath: '../../' }
          : undefined
      ),
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
        modules: true,
        ident: 'postcss',
        plugins: () => [
          require('postcss-rtl'),
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
  ]
  if (preProcessor) {
    loaders.push({
      loader: require.resolve(preProcessor),
      options: {
        sourceMap: true,
      },
    })
  }
  return loaders
}