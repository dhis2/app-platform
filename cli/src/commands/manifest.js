const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const path = require('path')

const generateManifest = require('../lib/generateManifest')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const bundleApp = require('../lib/bundleApp')

const handler = async ({ cwd }) => {
    const paths = makePaths(cwd)
    const config = parseConfig(paths)

    fs.ensureDirSync(path.dirname(paths.buildAppManifest))
    generateManifest(paths, config)

    await bundleApp(paths.buildAppOutput, paths.buildAppBundle)
}

const command = {
    command: 'manifest',
    desc: 'Test manifest functionality',
    handler,
}

module.exports = command
