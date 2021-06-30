const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const makeBundle = require('../lib/makeBundle.js')
const makePaths = require('../lib/paths.js')

exports.command = 'pack [folder]'

exports.describe = 'Create archive from the build.'

exports.builder = yargs =>
    yargs
        .positional('folder', {
            describe: 'The folder to pack relative to cwd.',
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
    const config = fs.readJsonSync(paths.buildAppConfigJson)

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

    const logPath = path.relative(process.cwd(), inputPath)
    reporter.info(
        `Creating archive from ${chalk.bold(
            logPath === '' ? '.' : logPath
        )} at ${chalk.bold(path.relative(process.cwd(), archivePath))}...`
    )

    await fs.remove(paths.buildAppBundleOutput)
    await makeBundle(inputPath, archivePath)
}
