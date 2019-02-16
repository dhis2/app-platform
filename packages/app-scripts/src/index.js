const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('scripts', {
  desc: 'Scripts for development of DHIS2 applications',
  builder: yargs => {
    yargs.commandDir('commands')
  },
})

module.exports = command
