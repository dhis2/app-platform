const { namespace } = require('@dhis2/cli-helpers-engine')
const buildCommand = require('./commands/build.js')
const publishCommand = require('./commands/publish.js')

module.exports = namespace('scripts', {
    desc: 'Scripts for development of DHIS2 applications',
    builder: yargs => {
        yargs.option('cwd', {
            description: 'working directory to use (defaults to cwd)',
        })
        yargs.commandDir('commands')
    },
})

module.exports.publishCommand = publishCommand
module.exports.buildCommand = buildCommand
