const { rewriteLocation } = require('./proxy')

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
