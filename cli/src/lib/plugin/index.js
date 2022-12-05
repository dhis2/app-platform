const build = require('./build')
const start = require('./start')

module.exports = ({ config, paths }) => ({
    build: () => build({ config, paths }),
    start: ({ port }) => start({ port, config, paths }),
})
