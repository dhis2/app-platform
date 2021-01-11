const compileApp = require('./compileApp')
const compileLibrary = require('./compileLibrary')

const compile = async ({
    config,
    paths,
    mode = 'development',
    watch = false,
} = {}) => {
    if (config.type === 'lib') {
        return await compileLibrary({ config, paths, mode, watch })
    } else {
        return await compileApp({ config, paths, mode, watch })
    }
}

module.exports = compile
