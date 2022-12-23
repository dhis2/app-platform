const build = require('./build')
const start = require('./start')

module.exports = ({ config, paths }) => ({
    build: ({ pluginName }) => build({ pluginName, config, paths }),
    start: ({ pluginName, port }) => start({ pluginName, port, config, paths }),
})
