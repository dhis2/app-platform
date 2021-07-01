const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const finalArchivePath = require('../lib/finalArchivePath.js')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const publishVersion = require('../lib/publishVersion.js')
const updateManifest = require('../lib/updateManifest.js')
const { handler: pack } = require('./pack.js')

const isValidServerVersion = v => !!/(\d+)\.(\d+)/.exec(v)

const requiredFields = new Set(['id', 'version', 'minDHIS2Version'])
const configFieldValidations = {
    minDHIS2Version: v =>
        isValidServerVersion(v) ? true : 'Invalid server version',
    maxDHIS2Version: v =>
        isValidServerVersion(v) ? true : 'Invalid server version',
}

const validateFields = (
    config,
    fieldNames = ['id', 'version', 'minDHIS2Version']
) => {
    fieldNames.forEach(fieldName => {
        const fieldValue = config[fieldName]
        if (
            requiredFields.has(fieldName) &&
            (fieldValue == null || fieldValue === '')
        ) {
            exit(
                1,
                `${fieldName} not found in config. Add an ${chalk.bold(
                    fieldName
                )}-field to ${chalk.bold('d2.config.js')}`
            )
        }
        const fieldValidation = configFieldValidations[fieldName]
        if (fieldValidation) {
            const valid = fieldValidation(fieldValue)
            if (typeof valid === 'string') {
                exit(1, `${fieldName}: ${valid}`)
            } else if (!valid) {
                exit(1, `Invalid ${fieldName}`)
            }
        }
    })
}

const resolveBundleFromParams = (cwd, params) => {
    const appBundle = {}
    try {
        const filePath = path.resolve(cwd, params.file)
        if (!fs.statSync(filePath).isFile()) {
            exit(1, `${params.file} is not a file`)
        }
        appBundle.id = params.appId
        appBundle.version = params.fileVersion
        appBundle.path = filePath
        appBundle.name = path.basename(filePath)
        appBundle.minDHIS2Version = params.minDHIS2Version
        appBundle.maxDHIS2Version = params.maxDHIS2Version
        return appBundle
    } catch (e) {
        exit(1, `File does not exist at ${params.file}`)
    }
}

const resolveBundleFromAppConfig = (cwd, config) => {
    // resolve file from built-bundle
    const appBundle = {}
    const paths = makePaths(cwd)

    validateFields(config)

    appBundle.id = config.id
    appBundle.version = config.version
    appBundle.path = path.relative(
        cwd,
        finalArchivePath({
            filepath: paths.buildAppBundle,
            name: config.name,
            version: config.version,
        })
    )
    appBundle.name = config.name
    appBundle.minDHIS2Version = config.minDHIS2Version
    appBundle.maxDHIS2Version = config.maxDHIS2Version

    return appBundle
}

const resolveBundle = ({ cwd, params, config }) => {
    if (params.file) {
        return resolveBundleFromParams(cwd, params)
    }
    return resolveBundleFromAppConfig(cwd, config)
}

const promptForConfig = async params => {
    if (!params.token) {
        exit(1, 'Missing API token.')
    }

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'token',
            message: 'App Hub API token',
            when: () => !params.token,
        },
        {
            type: 'input',
            name: 'appId',
            message: 'App Hub App-id',
            when: () => params.file && !params.appId,
        },
        {
            type: 'input',
            name: 'fileVersion',
            message: 'Version of the app',
            when: () => params.file && !params.fileVersion,
        },
        {
            type: 'input',
            name: 'minDHIS2Version',
            message: 'Minimum DHIS2 version supported',
            when: () => params.file && !params.minDHIS2Version,
            validate: v =>
                isValidServerVersion(v) ? true : 'Invalid server version',
        },
        {
            type: 'input',
            name: 'maxDHIS2Version',
            message: 'Maximum DHIS2 version supported',
            when: () => params.file && !params.maxDHIS2Version,
            validate: v =>
                !v || isValidServerVersion(v) ? true : 'Invalid server version',
        },
    ])

    return {
        ...params,
        ...responses,
    }
}

const handler = async ({ cwd = process.cwd(), ...params }) => {
    if (params.apikey) {
        reporter.debug(
            '[DEPRECATED] use of --apikey is deprecated, use --token instead.'
        )
        params.token = params.apikey
    }

    const paths = makePaths(cwd)
    const appConfig = parseConfig(paths)

    let publishConfig

    if (process.env.CI) {
        publishConfig = params
    } else {
        publishConfig = await promptForConfig(params)
    }

    const appBundle = resolveBundle({
        cwd,
        config: appConfig,
        params: publishConfig,
    })

    if (appConfig.type !== 'app') {
        exit(
            1,
            'Only publishing apps to the App Hub is currently supported. Please upload other types manually.'
        )
    }

    if (!publishConfig.file) {
        // update build/app manifests after prepare for release
        updateManifest({ version: appBundle.version }, paths)

        const bundle = path.parse(appBundle.path)

        // update bundle archive
        await pack({
            destination: path.resolve(cwd, bundle.dir),
            filename: bundle.base,
        })
    }

    await publishVersion({
        id: appBundle.id,
        token: publishConfig.token,
        baseUrl: publishConfig.baseUrl,
        channel: publishConfig.channel,
        minDhisVersion: appBundle.minDHIS2Version,
        maxDhisVersion: appBundle.maxDHIS2Version,
        filepath: appBundle.path,
        name: appBundle.name,
        version: appBundle.version,
    })
}

const command = {
    command: 'publish',
    alias: 'p',
    desc: 'Deploy the built application to a specific DHIS2 instance',
    builder: yargs =>
        yargs
            .options({
                apikey: {
                    alias: ['app-hub-api-key'],
                    type: 'string',
                    deprecated: true,
                    conflicts: 'token',
                },
                token: {
                    alias: ['app-hub-token', 'k'],
                    type: 'string',
                    description: 'The API token to use for authentication',
                    conflicts: 'apikey',
                },
                channel: {
                    alias: 'c',
                    description: 'The channel to publish the app-version to',
                    default: 'stable',
                },
                baseUrl: {
                    alias: 'b',
                    description: 'The base-url of the App Hub instance',
                    default: 'https://apps.dhis2.org',
                },
                minDHIS2Version: {
                    type: 'string',
                    description:
                        'The minimum version of DHIS2 the app supports',
                },
                maxDHIS2Version: {
                    type: 'string',
                    description:
                        'The maximum version of DHIS2 the app supports',
                },
                appId: {
                    type: 'string',
                    description:
                        'Only used with --file option. The App Hub ID for the App to publish to',
                    implies: 'file',
                },
                file: {
                    description:
                        'Path to the file to upload. This skips automatic resolution of the built app and uses this file-path to upload',
                },
                'file-version': {
                    type: 'string',
                    description:
                        'Only used with --file option. The semantic version of the app uploaded',
                    implies: 'file',
                },
            })
            .hide('apikey'),
    handler,
}

module.exports = command
