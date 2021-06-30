const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const FormData = require('form-data')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { createClient } = require('../lib/httpClient')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')
const updateManifest = require('../lib/updateManifest.js')
const { handler: pack } = require('./pack.js')

const constructUploadUrl = appId => `/api/v1/apps/${appId}/versions`

const isValidServerVersion = v => !!/(\d+)\.(\d+)/.exec(v)

const dumpHttpError = (message, response) => {
    if (!response) {
        reporter.error(message)
        return
    }

    reporter.error(
        message,
        response.status,
        typeof response.data === 'object'
            ? response.data.message
            : response.statusText
    )
    reporter.debugErr('Error details', response.data)
}

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
        paths.buildAppBundle
            .replace(/{name}/, config.name)
            .replace(/{version}/, config.version)
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

const promptForConfig = async (params, apikey) => {
    if (!apikey) {
        exit(1, 'Missing apikey parameter.')
    }

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'apikey',
            message: 'App Hub API-key',
            when: () => !apikey,
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
        apikey,
        ...responses,
    }
}

const resolveConfig = (params, apikey) => {
    return {
        ...params,
        apikey,
    }
}

const handler = async ({ cwd = process.cwd(), ...params }) => {
    const apikey = params.apikey || process.env.D2_APP_HUB_API_KEY

    const paths = makePaths(cwd)
    const appConfig = parseConfig(paths)

    let publishConfig

    if (process.env.CI) {
        publishConfig = resolveConfig(params, apikey)
    } else {
        publishConfig = await promptForConfig(params, apikey)
    }

    const appBundle = resolveBundle({
        cwd,
        config: appConfig,
        params: publishConfig,
    })
    const uploadAppUrl = constructUploadUrl(appBundle.id)

    if (appConfig.type !== 'app') {
        exit(
            1,
            'Only publishing apps to the App Hub is currently supported. Please upload other types manually.'
        )
    }

    // prepare for release
    updateManifest({ version: appBundle.version }, paths)

    const bundle = path.parse(appBundle.path)

    // update bundle archive
    await pack({
        destination: path.resolve(cwd, bundle.dir),
        filename: bundle.base,
    })

    const client = createClient({
        baseUrl: publishConfig.baseUrl,
        headers: {
            'x-api-key': publishConfig.apikey,
        },
    })

    const versionData = {
        version: appBundle.version,
        minDhisVersion: appBundle.minDHIS2Version,
        maxDhisVersion: appBundle.maxDHIS2Version || '',
        channel: publishConfig.channel,
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(appBundle.path))
    formData.append('version', JSON.stringify(versionData))

    try {
        reporter.print(
            `Uploading app bundle to ${publishConfig.baseUrl + uploadAppUrl}`
        )
        reporter.debug('Upload with version data', versionData)

        await client.post(uploadAppUrl, formData, {
            headers: formData.getHeaders(),
            timeout: 300000, // Ensure we have enough time to upload a large zip file
        })
        reporter.info(
            `Successfully published ${appBundle.name} with version ${appBundle.version}`
        )
    } catch (e) {
        if (e.isAxiosError) {
            dumpHttpError('Failed to upload app, HTTP error', e.response)
        } else {
            reporter.error(e)
        }
        exit(1)
    }
}

const command = {
    command: 'publish',
    alias: 'p',
    desc: 'Deploy the built application to a specific DHIS2 instance',
    builder: yargs =>
        yargs.options({
            apikey: {
                alias: 'k',
                type: 'string',
                description: 'The API-key to use for authentication',
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
                description: 'The minimum version of DHIS2 the app supports',
            },
            maxDHIS2Version: {
                type: 'string',
                description: 'The maximum version of DHIS2 the app supports',
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
        }),
    handler,
}

module.exports = command
