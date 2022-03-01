const build = require('./build')
const start = require('./start')

module.exports = ({ config, paths }) => ({
    // build: () => build({ config, paths }),
    // XXX
    build: async () => {
        try {
            await build({ config, paths })
        } catch (error) {
            console.log('\n\nerror building plugin:')
            console.error(error)
            console.log('\n')
            throw error
        }
    },
    start: ({ port }) => start({ port, config, paths }),
})
