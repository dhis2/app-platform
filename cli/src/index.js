const { namespace } = require('@dhis2/cli-helpers-engine')
const publishCommand = require('./commands/publish')

module.exports = namespace('scripts', {
    desc: 'Scripts for development of DHIS2 applications',
    builder: yargs =>
        yargs
            .option('cwd', {
                description: 'working directory to use (defaults to cwd)',
            })
            .commandDir('commands'),
})

module.exports.publishCommand = publishCommand
