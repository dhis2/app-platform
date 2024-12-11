const { namespace } = require('@dhis2/cli-helpers-engine')

module.exports = namespace('migrate', {
    desc: 'Scripts to make changes to DHIS2 apps',
    builder: (yargs) => yargs.commandDir('migrate'),
})
