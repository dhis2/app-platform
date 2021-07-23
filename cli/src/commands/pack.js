const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const finalArchivePath = require('../lib/finalArchivePath.js')
const makeBundle = require('../lib/makeBundle.js')
const makePaths = require('../lib/paths.js')

exports.command = 'pack [source]'

exports.describe = 'Create archive from the build.'

exports.builder = yargs =>
    yargs
        .positional('source', {
            describe: 'The source directory to pack relative to cwd.',
            type: 'string',
            defaultDescription: './build/app'
        })
        .option('destination', {
            alias: ['dest', 'd'],
            type: 'string',
            describe: 'Directory to save the packed archive to.',
            defaultDescription: './build/bundle'
        })
        .option('filename', {
            type: 'string',
            describe: 'Override the filename of the archive.',
            defaultDescription: '{app-name}-{version}.zip',
        })

exports.handler = async argv => {
    const { cwd = process.cwd(), source, destination, filename } = argv

    const paths = makePaths(cwd)
    const config = fs.readJsonSync(paths.buildAppConfigJson, { throws: false })

    if (!config) {
        // we may be dealing with a library or a unbuilt app
        // load the d2.config.js file from the project and check
        if (fs.existsSync(paths.config)) {
            const baseConfig = require(paths.config)

            if (baseConfig.type !== 'app') {
                exit(
                    1,
                    `Unsupported type '${baseConfig.type}', only 'app' is currently supported.`
                )
            }
        }
    }

    const inputPath = path.resolve(cwd, source ? source : paths.buildAppOutput)

    const outputPath = path.resolve(
        cwd,
        destination ? destination : paths.buildAppBundleOutput,
        filename ? filename : paths.buildAppBundleFile
    )

    if (!fs.existsSync(inputPath)) {
        exit(
            1,
            `The folder ${path.relative(
                cwd,
                inputPath
            )} does not exist. Maybe you forgot to build?`
        )
    }

    const archivePath = finalArchivePath({
        filepath: outputPath,
        name: config.name,
        version: config.version,
    })

    const logPath = path.relative(process.cwd(), inputPath)
    reporter.info(
        `Creating archive from ${chalk.bold(
            logPath === '' ? '.' : logPath
        )} at ${chalk.bold(path.relative(process.cwd(), archivePath))}...`
    )

    await fs.remove(paths.buildAppBundleOutput)
    await makeBundle(inputPath, archivePath)
}
