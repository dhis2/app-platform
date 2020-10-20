const { parseServerVersion } = require('./parseServerVersion')

describe('parseServerVersion', () => {
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
        expect(parseServerVersion('2.34.3')).toMatchObject({
            major: 2,
            minor: 34,
            patch: 3,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(0)
    })

    it('Should correctly parse a snapshot version', () => {
        expect(parseServerVersion('2.34-SNAPSHOT')).toMatchObject({
            major: 2,
            minor: 34,
            patch: undefined,
            tag: 'SNAPSHOT',
        })
        expect(console.warn).toHaveBeenCalledTimes(0)
    })

    it('Should not break on null or undefined', () => {
        expect(parseServerVersion(null)).toMatchObject({
            major: undefined,
            minor: undefined,
            patch: undefined,
            tag: undefined,
        })

        expect(parseServerVersion(undefined)).toMatchObject({
            major: undefined,
            minor: undefined,
            patch: undefined,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(2)
    })

    it('Should correctly parse a future major version', () => {
        expect(parseServerVersion('6.4.2')).toMatchObject({
            major: 6,
            minor: 4,
            patch: 2,
            tag: undefined,
        })
        expect(console.warn).toHaveBeenCalledTimes(1)
    })

    it('Should not break on non-numeric version string', () => {
        expect(parseServerVersion('this.is.a.version-test')).toMatchObject({
            major: undefined,
            minor: undefined,
            patch: undefined,
            tag: 'test',
        })
        expect(console.warn).toHaveBeenCalledTimes(1)
    })
})
