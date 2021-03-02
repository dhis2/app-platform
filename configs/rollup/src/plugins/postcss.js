import postcss from 'rollup-plugin-postcss'

export default ({ mode }) => 
    postcss({
        autoModules: true,
        plugins: [
            // TODO: PostCSS prefix plugin
            // See https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/webpack.config.js#L134-L149
        ],
    })