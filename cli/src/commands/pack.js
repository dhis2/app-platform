const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const finalArchivePath = require('../lib/finalArchivePath.js')
const makeBundle = require('../lib/makeBundle.js')
const parseConfig = require('../lib/parseConfig.js')
const makePaths = require('../lib/paths.js')

process.on('unhandledRejection', err => {
    throw err
})

exports.command = 'pack [source]'

exports.describe = 'Create a .zip archive of a built application'

exports.builder = yargs =>
    yargs
        .positional('source', {
            describe: 'The source directory to pack relative to cwd.',
            type: 'string',
            defaultDescription: './build/app',
        })
        .option('destination', {
            alias: ['dest', 'd'],
            type: 'string',
            describe: 'Directory to save the packed archive to.',
            defaultDescription: './build/bundle',
        })
        .option('filename', {
            type: 'string',
            describe: 'Override the filename of the archive.',
            defaultDescription: '{app-name}-{version}.zip',
        })
        .option('app-name', {
            type: 'string',
            describe: 'The name of the app to replace in filename',
            defaultDescription: '${config.name}',
        })
        .option('app-version', {
            type: 'string',
            describe: 'The version of the app to replace in filename',
            defaultDescription: '${config.version}',
        })

exports.handler = async argv => {
    const {
        cwd = process.cwd(),
        source,
        destination,
        filename,
        appName,
        appVersion,
    } = argv

    if (filename && !filename.endsWith('.zip')) {
        exit(1, `Output filename must have the extension .zip`)
    }

    const paths = makePaths(cwd)

    const inputPath = path.resolve(cwd, source || paths.buildAppOutput)
    if (!fs.existsSync(inputPath)) {
        exit(
            1,
            `The folder ${path.relative(
                cwd,
                inputPath
            )} does not exist. Maybe you forgot to build?`
        )
    }

    const builtConfig = fs.readJsonSync(
        path.join(inputPath, 'd2.config.json'),
        {
            throws: false,
        }
    )
    const baseConfig = fs.existsSync(paths.config) ? parseConfig(paths) : null

    const resolved = {
        destination,
        appName,
        appVersion,
    }
    if (builtConfig) {
        resolved.appName = resolved.appName || builtConfig.name
        resolved.appVersion = resolved.appVersion || builtConfig.version
    } else if (baseConfig) {
        // we may be dealing with a library or a unbuilt app
        // load the d2.config.js file from the project and check
        if (baseConfig.type !== 'app') {
            exit(
                1,
                `Unsupported type '${baseConfig.type}', only 'app' is currently supported.`
            )
        }

        resolved.destination =
            resolved.destination || paths.buildAppBundleOutput
        resolved.appName = resolved.appName || baseConfig.name
        resolved.appVersion = resolved.appVersion || baseConfig.version
    }

    const outputPath = path.resolve(
        cwd,
        resolved.destination || '.',
        filename || paths.buildAppBundleFile
    )

    const archivePath = finalArchivePath({
        filepath: outputPath,
        name: resolved.appName || 'app',
        version: resolved.appVersion || 'latest',
    })

    const logPath = path.relative(process.cwd(), inputPath)
    reporter.info(
        `Creating archive from ${chalk.bold(
            logPath === '' ? '.' : logPath
        )} at ${chalk.bold(path.relative(process.cwd(), archivePath))}...`
    )

    await makeBundle(inputPath, archivePath)
}
