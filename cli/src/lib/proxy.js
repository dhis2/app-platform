const url = require('url')
const { reporter } = require('@dhis2/cli-helpers-engine')
const httpProxy = require('http-proxy')
const _ = require('lodash')
const transformProxyResponse = require('node-http-proxy-json')

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

const isUrl = string => {
    try {
        const { protocol } = new URL(string)
        return protocol === 'http:' || protocol === 'https:'
    } catch (error) {
        return false
    }
}

const transformJsonResponse = (res, { target, baseUrl }) => {
    switch (typeof res) {
        case 'string':
            if (isUrl(res)) {
                return rewriteLocation({ location: res, target, baseUrl })
            }
            return res
        case 'object':
            if (Array.isArray(res)) {
                return res.map(r =>
                    transformJsonResponse(r, { target, baseUrl })
                )
            }
            if(res === null) {
                return res
            }
            return _.transform(
                res,
                (result, value, key) => {
                    result[key] = transformJsonResponse(value, {
                        target,
                        baseUrl,
                    })
                },
                {}
            )
        default:
            return res
    }
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

        if (
            proxyRes.headers['content-type'] &&
            proxyRes.headers['content-type'].includes('application/json')
        ) {
            transformProxyResponse(res, proxyRes, body => {
                if (body) {
                    return transformJsonResponse(body, {
                        target,
                        baseUrl,
                    })
                }
                return body
            })
        }
    })

    proxyServer.on('error', error => {
        reporter.warn(error)
    })

    proxyServer.listen(port)
}

exports.rewriteLocation = rewriteLocation
exports.transformJsonResponse = transformJsonResponse
