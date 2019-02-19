const { namespace } = require('@dhis2/cli-helpers-engine')

const command = namespace('scripts', {
  desc: 'Scripts for development of DHIS2 applications',
  builder: yargs => {
    yargs.option('cwd', {
      description: 'working directory to use',
      default: process.cwd()
    })
    yargs.commandDir('commands')
  },
})

module.exports = command
