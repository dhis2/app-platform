const build = require('./build')
const start = require('./start')

module.exports = ({ config, paths, pluginifiedApp = false }) => ({
    build: () => build({ config, paths, pluginifiedApp }),
    start: ({ port }) => start({ port, config, paths, pluginifiedApp }),
})
