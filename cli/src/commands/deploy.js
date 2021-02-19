const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const FormData = require('form-data')
const fs = require('fs-extra')
const inquirer = require('inquirer')
const { constructAppUrl } = require('../lib/constructAppUrl')
const { createClient } = require('../lib/httpClient')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')

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

const promptForDhis2Config = async params => {
    if (
        process.env.CI &&
        (!params.baseUrl || !params.username || !params.password)
    ) {
        reporter.error(
            'Prompt disabled in CI mode - missing baseUrl, username, or password parameter.'
        )
        process.exit(1)
    }

    const isValidUrl = input =>
        input && input.length && input.match(/^https?:\/\/[^/.]+/)

    const responses = await inquirer.prompt([
        {
            type: 'input',
            name: 'baseUrl',
            message: 'DHIS2 instance URL:',
            when: () => !params.baseUrl,
            validate: input =>
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

const handler = async ({ cwd = process.cwd(), ...params }) => {
    const paths = makePaths(cwd)
    const config = parseConfig(paths)

    const dhis2Config = await promptForDhis2Config(params)

    if (config.standalone) {
        reporter.error(`Standalone apps cannot be deployed to DHIS2 instances`)
        process.exit(1)
    }

    const appBundle = path.relative(
        cwd,
        paths.buildAppBundle
            .replace(/{{name}}/, config.name)
            .replace(/{{version}}/, config.version)
    )

    if (!fs.existsSync(appBundle)) {
        reporter.error(
            `App bundle does not exist, run ${chalk.bold(
                'd2-app-scripts build'
            )} before deploying.`
        )
        process.exit(1)
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
            reporter.error(
                `Invalid server version ${rawServerVersion} found, aborting...`
            )
            process.exit(1)
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
        process.exit(1)
    }

    const appUrl = constructAppUrl(dhis2Config.baseUrl, config, serverVersion)

    try {
        reporter.print('Uploading app bundle...')
        await client.post('/api/apps', formData, {
            headers: {
                ...formData.getHeaders(),
            },
            timeout: 30000, // Ensure we have enough time to upload a large zip file
        })
        reporter.info(
            `Successfully deployed ${config.name} to ${dhis2Config.baseUrl}`
        )
    } catch (e) {
        dumpHttpError('Failed to upload app, HTTP error', e.response)
        process.exit(1)
    }

    reporter.debug(`Testing app launch url at ${appUrl}...`)
    try {
        await client.get(appUrl)
    } catch (e) {
        dumpHttpError(`Uploaded app not responding at ${appUrl}`)
        process.exit(1)
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
    },
    handler,
}

module.exports = command
