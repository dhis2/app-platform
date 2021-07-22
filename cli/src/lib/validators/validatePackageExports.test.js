const { validatePackageExports } = require('./validatePackageExports')

describe('validatePackageExports', () => {
    it('returns true for apps', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'app',
                },
            })
        ).toBe(true)
    })

    it('returns true if no lib entry point is defined', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'lib',
                    entryPoints: {},
                },
            })
        ).toBe(true)
    })
})
