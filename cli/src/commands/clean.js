const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const makePaths = require('../lib/paths')

process.on('unhandledRejection', err => {
    throw err
})

const handler = async ({ cwd }) => {
    const paths = makePaths(cwd)

    const dirsToClean = [paths.d2, paths.buildOutput]

    reporter.info('Cleaning intermediate directories and build output...')
    dirsToClean.forEach(dir => {
        reporter.print(' * ' + dir)
        fs.removeSync(dir)
    })
}

const command = {
    command: 'clean',
    desc: 'Remove intermediate directories and build output',
    handler,
}

module.exports = command
