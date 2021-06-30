const fs = require('fs')
const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const bundleApp = require('../lib/bundleApp')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')

exports.command = 'pack [folder]'

exports.describe = 'Create archive from the build.'

exports.builder = yargs =>
    yargs
        .positional('folder', {
            describe: 'The folder to pack',
            type: 'string',
            defaultDescription: '.',
        })
        .option('destination', {
            type: 'string',
            describe: 'Directory to save the packed archive to.',
            defaultDescription: '.',
        })
        .option('filename', {
            type: 'string',
            describe: 'Override the filename of the archive.',
            defaultDescription: '{app-name}-{version}.zip',
        })

exports.handler = async argv => {
    const { cwd = process.cwd(), folder, destination, filename } = argv

    const paths = makePaths(cwd)
    const config = parseConfig(paths)

    let inputPath, outputPath
    if (config.type === 'app') {
        inputPath = path.resolve(cwd, folder ? folder : paths.buildAppOutput)

        outputPath = path.resolve(
            cwd,
            destination ? destination : paths.buildAppBundleOutput,
            filename ? filename : paths.buildAppBundleFile
        )
    } else {
        inputPath = path.resolve(cwd, folder ? folder : '.')

        outputPath = path.resolve(
            cwd,
            destination ? destination : paths.buildLibBundleOutput,
            filename ? filename : paths.buildLibBundleFile
        )
    }

    if (!fs.existsSync(inputPath)) {
        exit(
            1,
            `The folder ${path.relative(
                cwd,
                inputPath
            )} does not exist. Maybe you forgot to build?`
        )
    }

    // for scoped names in package.json
    const clean = str => str.replace(/@/, '').replace(/\//, '-')

    // replace placeholder within names defined in lib/paths.js
    const archivePath = outputPath
        .replace(/{name}/, clean(config.name))
        .replace(/{version}/, config.version)

    reporter.info(
        `Creating archive from ${chalk.bold(
            path.relative(cwd, inputPath)
        )} at ${chalk.bold(path.relative(cwd, archivePath))}...`
    )

    await bundleApp(inputPath, archivePath)
}
