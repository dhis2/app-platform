const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const detectPort = require('detect-port')
const createProxyServer = require('../proxy')

module.exports = async function createLocalProxyServer({
    proxy,
    proxyPort,
    appPort,
}) {
    if (proxy) {
        const newProxyPort = await detectPort(proxyPort)
        const proxyBaseUrl = `http://localhost:${newProxyPort}`

        reporter.print('')
        reporter.info('Starting proxy server...')
        reporter.print(
            `The proxy for ${chalk.bold(
                proxy
            )} is now available on port ${newProxyPort}`
        )
        reporter.print('')

        createProxyServer({
            target: proxy,
            baseUrl: proxyBaseUrl,
            port: newProxyPort,
            shellPort: appPort,
        })
    }
}
