const {
    parseVersion,
    parseDHIS2ServerVersion,
} = require('./parseServerVersion')

describe('parseVersion', () => {
    let originalConsoleWarn
    beforeAll(() => {
        originalConsoleWarn = console.warn
    })
    beforeEach(() => {
        // Capture console warnings
        console.warn = jest.fn()
    })
    afterAll(() => {
        console.warn = originalConsoleWarn
    })

    it('Should correctly parse a simple released version', () => {
        expect(parseVersion('2.34.3')).toMatchObject({
            full: '2.34.3',
            major: 2,
            minor: 34,
            patch: 3,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(0)
    })

    it('Should correctly parse a snapshot version', () => {
        expect(parseVersion('2.34-SNAPSHOT')).toMatchObject({
            full: '2.34-SNAPSHOT',
            major: 2,
            minor: 34,
            patch: undefined,
            tag: 'SNAPSHOT',
        })
        expect(console.warn).toHaveBeenCalledTimes(0)
    })

    it('Should not break on null or undefined', () => {
        expect(parseVersion(null)).toMatchObject({
            full: null,
            major: undefined,
            minor: undefined,
            patch: undefined,
            tag: undefined,
        })

        expect(parseVersion(undefined)).toMatchObject({
            full: undefined,
            major: undefined,
            minor: undefined,
            patch: undefined,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(2)
    })
})

describe('parseDHIS2ServerVersion', () => {
    it('Should correctly parse a future major version, but log a warning', () => {
        expect(parseDHIS2ServerVersion('6.4.2')).toMatchObject({
            full: '6.4.2',
            major: 6,
            minor: 4,
            patch: 2,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(1)
    })

    it('Should not break on non-numeric version string, but log a warning', () => {
        expect(parseDHIS2ServerVersion('this.is.a.version-test')).toMatchObject(
            {
                full: 'this.is.a.version-test',
                major: undefined,
                minor: undefined,
                patch: undefined,
                tag: 'test',
            }
        )
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})
