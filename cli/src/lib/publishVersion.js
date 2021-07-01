const { reporter, exit } = require('@dhis2/cli-helpers-engine')
const FormData = require('form-data')
const fs = require('fs-extra')
const { createClient } = require('../lib/httpClient')

const constructUploadUrl = appId => `/api/v1/apps/${appId}/versions`

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

module.exports = async ({
    name,
    id,
    token,
    baseUrl,
    version,
    minDhisVersion,
    maxDhisVersion = '',
    channel,
    filepath,
}) => {
    const client = createClient({
        baseUrl,
        headers: {
            'x-api-key': token,
        },
    })

    const versionData = {
        version,
        minDhisVersion,
        maxDhisVersion,
        channel,
    }

    const formData = new FormData()
    formData.append('file', fs.createReadStream(filepath))
    formData.append('version', JSON.stringify(versionData))

    try {
        const uploadAppUrl = constructUploadUrl(id)

        reporter.print(`Uploading app bundle to ${baseUrl + uploadAppUrl}`)
        reporter.debug('Upload with version data', versionData)

        await client.post(uploadAppUrl, formData, {
            headers: formData.getHeaders(),
            timeout: 300000, // Ensure we have enough time to upload a large zip file
        })

        reporter.info(`Successfully published ${name} with version ${version}`)
    } catch (e) {
        if (e.isAxiosError) {
            dumpHttpError('Failed to upload app, HTTP error', e.response)
        } else {
            reporter.error(e)
        }
        exit(1)
    }
}
