const path = require('path')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const FormData = require('form-data')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { constructAppUrl } = require('../lib/constructAppUrl')
const finalArchivePath = require('../lib/finalArchivePath.js')
const { createClient } = require('../lib/httpClient')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths.js')

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

const promptForDhis2Config = async (params) => {
    if (
        process.env.CI &&
        (!params.baseUrl || !params.username || !params.password)
    ) {
        exit(
            1,
            'Prompt disabled in CI mode - missing baseUrl, username, or password parameter.'
        )
    }

    const isValidUrl = (input) =>
        input && input.length && input.match(/^https?:\/\/[^/.]+/)

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'baseUrl',
            message: 'DHIS2 instance URL:',
            when: () => !params.baseUrl,
            validate: (input) =>
                isValidUrl(input)
                    ? true
                    : 'Please enter a valid URL, it must start with http:// or https://',
        },
        {
            type: 'input',
            name: 'username',
            message: 'DHIS2 instance username:',
            when: () => !params.username,
        },
        {
            type: 'password',
            name: 'password',
            message: 'DHIS2 instance password:',
            when: () => !params.password,
        },
    ])

    return {
        baseUrl: responses.baseUrl || params.baseUrl,
        auth: {
            username: responses.username || params.username,
            password: responses.password || params.password,
        },
    }
}

const handler = async ({ cwd = process.cwd(), timeout, ...params }) => {
    const paths = makePaths(cwd)
    const config = parseConfig(paths)

    const dhis2Config = await promptForDhis2Config(params)

    if (config.standalone) {
        exit(1, `Standalone apps cannot be deployed to DHIS2 instances`)
    }

    const appBundle = path.relative(
        cwd,
        finalArchivePath({
            filepath: paths.buildAppBundle,
            name: config.name,
            version: config.version,
        })
    )

    if (!fs.existsSync(appBundle)) {
        exit(
            1,
            `App bundle does not exist, run ${chalk.bold(
                'd2-app-scripts build'
            )} before deploying.`
        )
    }

    const client = createClient(dhis2Config)
    const formData = new FormData()
    formData.append('file', fs.createReadStream(appBundle))

    let serverVersion
    try {
        reporter.print(`Pinging server ${dhis2Config.baseUrl}...`)
        const rawServerVersion = (await client.get('/api/system/info.json'))
            .data.version
        const parsedServerVersion = /(\d+)\.(\d+)/.exec(rawServerVersion)
        if (!parsedServerVersion) {
            exit(
                1,
                `Invalid server version ${rawServerVersion} found, aborting...`
            )
        }
        serverVersion = {
            full: parsedServerVersion[0],
            major: parsedServerVersion[1],
            minor: parsedServerVersion[2],
        }
        reporter.debug(
            'Found server version',
            serverVersion.full,
            `(${rawServerVersion})`
        )
    } catch (e) {
        dumpHttpError(
            `Server ${chalk.bold(dhis2Config.baseUrl)} could not be contacted`,
            e.response
        )
        exit(1)
    }

    try {
        reporter.print('Uploading app bundle...')
        await client.post('/api/apps', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: timeout * 1000, // Ensure we have enough time to upload a large zip file
        })
        reporter.info(
            `Successfully deployed ${config.name} to ${dhis2Config.baseUrl}`
        )
    } catch (e) {
        dumpHttpError('Failed to upload app, HTTP error', e.response)
        exit(1)
    }

    // todo: modify for multiple/named plugins
    // https://dhis2.atlassian.net/browse/LIBS-394
    const appUrl = constructAppUrl({
        baseUrl: dhis2Config.baseUrl,
        config,
        serverVersion,
        // if there is not an app entry point, use the plugin URL
        plugin: !config.entryPoints.app && config.entryPoints.plugin,
    })

    reporter.debug(`Testing app launch url at ${appUrl}...`)
    try {
        await client.get(appUrl)
    } catch (e) {
        dumpHttpError(`Uploaded app not responding at ${appUrl}`)
        exit(1)
    }
    reporter.print(`App is available at ${appUrl}`)
}

const command = {
    command: 'deploy [baseUrl]',
    alias: 'd',
    desc: 'Deploy the built application to a specific DHIS2 instance',
    builder: {
        username: {
            alias: 'u',
            description:
                'The username for authenticating with the DHIS2 instance',
        },
        timeout: {
            description:
                'The timeout (in seconds) for uploading the app bundle',
            default: 300,
        },
    },
    handler,
}

module.exports = command
