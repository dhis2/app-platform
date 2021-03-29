const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const FormData = require('form-data')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { createClient } = require('../lib/httpClient')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')

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
            (requiredFields.has(fieldName) && fieldValue == null) ||
            fieldValue === ''
        ) {
            reporter.error(
                `${fieldName} not found in config. Add an ${chalk.bold(
                    fieldName
                )}-field to ${chalk.bold('d2.config.js')}`
            )
            process.exit(1)
        }
        const fieldValidation = configFieldValidations[fieldName]
        if (fieldValidation) {
            const valid = fieldValidation(fieldValue)
            if (typeof valid === 'string') {
                reporter.error(`${fieldName}: ${valid}`)
                process.exit(1)
            } else if (!valid) {
                reporter.error(`Invalid ${fieldName}`)
                process.exit(1)
            }
        }
    })
}

const resolveBundle = (cwd, params) => {
    const appBundle = {}
    // use file-path from params
    if (params.file) {
        try {
            const filePath = path.resolve(cwd, params.file)
            if (!fs.statSync(filePath).isFile()) {
                reporter.error(`${params.file} is not a file`)
                process.exit(1)
            }
            appBundle.id = params.appId
            appBundle.version = params.fileVersion
            appBundle.path = filePath
            appBundle.name = path.basename(filePath)
            appBundle.minDHIS2Version = params.minDHIS2Version
            appBundle.maxDHIS2Version = params.maxDHIS2Version
        } catch (e) {
            reporter.error(`File does not exist at ${params.file}`)
            process.exit(1)
        }
    } else {
        // resolve file from built-bundle
        const paths = makePaths(cwd)
        const builtAppConfig = parseConfig(paths)
        validateFields(builtAppConfig)

        appBundle.id = builtAppConfig.id
        appBundle.version = builtAppConfig.version
        appBundle.path = path.relative(
            cwd,
            paths.buildAppBundle
                .replace(/{{name}}/, builtAppConfig.name)
                .replace(/{{version}}/, builtAppConfig.version)
        )
        appBundle.name = builtAppConfig.name
        appBundle.minDHIS2Version = builtAppConfig.minDHIS2Version
        appBundle.maxDHIS2Version = builtAppConfig.maxDHIS2Version

        if (!fs.existsSync(appBundle.path)) {
            reporter.error(
                `App bundle does not exist, run ${chalk.bold(
                    'd2-app-scripts build'
                )} before deploying.`
            )
            process.exit(1)
        }
    }

    return appBundle
}

const promptForConfig = async params => {
    if (process.env.CI && (!params.apikey || !params.minVersion)) {
        reporter.error(
            'Prompt disabled in CI mode - missing apikey or minVersion parameter.'
        )
        process.exit(1)
    }

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'apikey',
            message: 'App Hub API-key',
            when: () => !params.apikey,
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
    const publishConfig = await promptForConfig(params)

    const appBundle = resolveBundle(cwd, publishConfig)
    const uploadAppUrl = constructUploadUrl(appBundle.id)

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
            timeout: 30000, // Ensure we have enough time to upload a large zip file
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
        process.exit(1)
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
