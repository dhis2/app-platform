const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const path = require('path')
const fs = require('fs-extra')
const FormData = require('form-data')

const makePaths = require('../lib/paths')
const parseConfig = require('../lib/parseConfig')
const { createClient } = require('../lib/httpClient')

const constructAppUrl = (baseUrl, config, serverVersion) =>
    baseUrl +
    (config.coreApp ? '/dhis-web-' : '/api/apps/') +
    (serverVersion.minor < 35 ? config.title : config.name)
        .replace(/[^A-Za-z0-9\s-]/g, '')
        .replace(/\s+/g, '-') +
    (serverVersion.minor < 35 ? '/index.html' : '/')

const dumpHttpError = (message, response) => {
    reporter.error(
        message,
        response.status,
        typeof response.data === 'object'
            ? response.data.message
            : response.statusText
    )
    reporter.debugErr('Error details', response.data)
}

const handler = async ({ cwd = process.cwd(), dhis2baseUrl }) => {
    const paths = makePaths(cwd)
    const config = parseConfig(paths)

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

    const dhis2config = {
        baseUrl: dhis2baseUrl,
        auth: {
            username: 'admin',
            password: 'district',
        },
    }

    const client = createClient(dhis2config)
    const formData = new FormData()
    formData.append('file', fs.createReadStream(appBundle))

    let serverVersion
    try {
        reporter.print(`Pinging server ${dhis2baseUrl}...`)
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
            `Server ${dhis2baseUrl} could not be contacted, HTTP error`,
            e.response
        )
        process.exit(1)
    }

    const appUrl = constructAppUrl(dhis2baseUrl, config, serverVersion)

    try {
        reporter.print('Uploading app bundle...')
        await client.post('/api/apps', formData, {
            headers: {
                ...formData.getHeaders(),
            },
        })
        reporter.info(`Successfully deployed ${config.name} to ${dhis2baseUrl}`)
    } catch (e) {
        dumpHttpError('Failed to upload app, HTTP error', e.response)
        process.exit(1)
    }

    try {
        reporter.debug(`Testing app launch url at ${appUrl}...`)
        await client.get(appUrl)
    } catch (e) {
        dumpHttpError(`Uploaded app not responding at ${appUrl}`, e.response)
        process.exit(1)
    }
    reporter.print(`App is available at ${appUrl}`)
}

const command = {
    command: 'deploy <dhis2baseUrl>',
    alias: 'd',
    desc: 'Deploy the built application to a specific DHIS2 instance',
    handler,
}

module.exports = command
