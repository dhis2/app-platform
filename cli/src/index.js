const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('scripts', {
    desc: 'Scripts for development of DHIS2 applications',
    builder: yargs => {
        yargs.option('cwd', {
            description: 'working directory to use (defaults to cwd)',
        })
        yargs.commandDir('commands')
    },
})
