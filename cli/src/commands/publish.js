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
        } catch (e) {
            reporter.error(`File does not exist at ${params.file}`)
            process.exit(1)
        }
    } else {
        // resolve file from built-bundle
        const paths = makePaths(cwd)
        const builtAppConfig = parseConfig(paths)
        if (!builtAppConfig.id) {
            reporter.error(
                `No App Hub id found for app. Add an ${chalk.bold(
                    'id'
                )}-field to ${chalk.bold('d2.config.js')}`
            )
            process.exit(1)
        }
        appBundle.id = builtAppConfig.id
        appBundle.version = builtAppConfig.version
        appBundle.path = path.relative(
            cwd,
            paths.buildAppBundle
                .replace(/{{name}}/, builtAppConfig.name)
                .replace(/{{version}}/, builtAppConfig.version)
        )
        appBundle.name = builtAppConfig.name

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
    if (process.env.CI && (!params.apiKey || !params.minVersion)) {
        reporter.error(
            'Prompt disabled in CI mode - missing apiKey or minVersion parameter.'
        )
        process.exit(1)
    }

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'apiKey',
            message: 'App Hub API-key',
            when: () => !params.apiKey,
        },
        {
            type: 'input',
            name: 'minVersion',
            message: 'Minimum DHIS2 version supported',
            when: () => !params.minVersion,
            validate: v =>
                isValidServerVersion(v) ? true : 'Invalid server version',
        },
        {
            type: 'input',
            name: 'maxVersion',
            message: 'Maximum DHIS2 version supported',
            when: () => !params.maxVersion,
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
    const appBundle = resolveBundle(cwd, params)
    const uploadAppUrl = constructUploadUrl(appBundle.id)
    const publishConfig = await promptForConfig(params)

    const client = createClient({
        baseUrl: params.baseUrl,
        headers: {
            'x-api-key': publishConfig.apiKey,
        },
    })
    const versionData = {
        version: appBundle.version,
        minDhisVersion: publishConfig.minVersion,
        maxDhisVersion: publishConfig.maxVersion,
        channel: publishConfig.channel,
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(appBundle.path))
    formData.append('version', JSON.stringify(versionData))

    try {
        reporter.print(`Uploading app bundle to ${uploadAppUrl}`)
        reporter.debug('Upload with version data', versionData)

        await client.post(uploadAppUrl, formData, {
            headers: formData.getHeaders(),
            port: 3000,
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
            apiKey: {
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
            minVersion: {
                type: 'string',
                description: 'The minimum version of DHIS2 the app supports',
            },
            maxVersion: {
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
                implies: ['file-version', 'appId'],
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
