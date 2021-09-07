const { rewriteLocation, transformJsonResponse } = require('./proxy')

describe('transformJsonResponse', () => {
    it('rewrites URLs in responses if they match the proxy target', () => {
        const transformedResponse = transformJsonResponse(
            {
                a: {
                    b: {
                        c: 'https://play.dhis2.org/dev/api/endpoint',
                    },
                },
            },
            {
                target: 'https://play.dhis2.org/dev',
                baseUrl: 'http://localhost:8080',
            }
        )

        expect(transformedResponse.a.b.c).toBe(
            'http://localhost:8080/api/endpoint'
        )
    })
})

describe('rewriteLocation', () => {
    it('rewrites locations if they match the proxy target', () => {
        const baseUrl = 'http://localhost:8080'

        expect(
            rewriteLocation({
                location: 'https://play.dhis2.org/dev/login.action',
                target: 'https://play.dhis2.org/dev',
                baseUrl,
            })
        ).toBe(`${baseUrl}/login.action`)

        expect(
            rewriteLocation({
                location: 'https://play.dhis2.org/dev/page?param=value',
                target: 'https://play.dhis2.org/dev',
                baseUrl,
            })
        ).toBe(`${baseUrl}/page?param=value`)

        expect(
            rewriteLocation({
                location: 'https://server.com:1234',
                target: 'https://server.com:5678',
                baseUrl,
            })
        ).toBe('https://server.com:1234')

        expect(
            rewriteLocation({
                location: 'https://server.com',
                target: 'http://server.com',
                baseUrl,
            })
        ).toBe(baseUrl)

        expect(
            rewriteLocation({
                location: 'https://play.dhis2.org/dev/api/dev',
                target: 'https://play.dhis2.org/dev',
                baseUrl,
            })
        ).toBe(`${baseUrl}/api/dev`)
    })

    it('does not rewrite locations if they do not match the proxy target', () => {
        ;[
            {
                location: 'https://example.com/path',
                target: 'https://play.dhis2.org/dev',
                baseUrl: 'http://localhost:8080',
            },
            {
                location: 'https://play.dhis2.org/2.35dev',
                target: 'https://play.dhis2.org/dev',
                baseUrl: 'http://localhost:8080',
            },
            {
                location: 'http://server.com:1234',
                target: 'http://server.com:5678',
                baseUrl: 'http://localhost:8080',
            },
        ].forEach(args => {
            expect(rewriteLocation(args)).toBe(args.location)
        })
    })
})
