const url = require('url')
const { reporter } = require('@dhis2/cli-helpers-engine')
const httpProxy = require('http-proxy')

const stripCookieSecure = cookie => {
    return cookie
        .split(';')
        .filter(v => v.trim().toLowerCase() !== 'secure')
        .join('; ')
}

const rewriteLocation = ({ location, target, baseUrl }) => {
    const parsedLocation = url.parse(location)
    const parsedTarget = url.parse(target)
    const parsedBaseUrl = url.parse(baseUrl)

    if (
        parsedLocation.host === parsedTarget.host &&
        parsedLocation.pathname.startsWith(parsedTarget.pathname)
    ) {
        return url.format({
            ...parsedBaseUrl,
            pathname: parsedLocation.pathname.replace(
                parsedTarget.pathname,
                ''
            ),
            search: parsedLocation.search,
        })
    }
    return location
}

exports = module.exports = ({ target, baseUrl, port, shellPort }) => {
    const proxyServer = httpProxy.createProxyServer({
        target,
        changeOrigin: true,
        secure: false,
        protocolRewrite: 'http',
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
    })

    proxyServer.on('proxyRes', (proxyRes, req, res) => {
        if (proxyRes.headers['access-control-allow-origin']) {
            res.setHeader(
                'access-control-allow-origin',
                `http://localhost:${shellPort}`
            )
        }

        if (proxyRes.headers.location) {
            proxyRes.headers.location = rewriteLocation({
                location: proxyRes.headers.location,
                target,
                baseUrl,
            })
        }

        const sc = proxyRes.headers['set-cookie']
        if (Array.isArray(sc)) {
            proxyRes.headers['set-cookie'] = sc.map(stripCookieSecure)
        }
    })

    proxyServer.on('error', error => {
        reporter.warn(error)
    })

    proxyServer.listen(port)
}

exports.rewriteLocation = rewriteLocation
