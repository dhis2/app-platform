const path = require('path')
const { validatePackageExports } = require('./validatePackageExports')

describe('validatePackageExports', () => {
    it('always returns true for apps', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'app',
                },
            })
        ).toBe(true)
    })

    it('returns true if no library entry point is defined', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'lib',
                    entryPoints: {},
                },
            })
        ).toBe(true)
    })

    it('returns true if a single library entrypoint is defined and package.json contains the expected content', async () => {
        const pkg = {
            main: './build/cjs/index.js',
            module: './build/es/index.js',
            exports: {
                require: './build/cjs/index.js',
                import: './build/es/index.js',
            },
        }
        const config = {
            type: 'lib',
            entryPoints: {
                lib: './src/index.js',
            },
        }
        const paths = {
            src: `/foo/bar/src`,
            package: `/foo/bar/package.json`,
            buildOutput: `/foo/bar/build`,
        }

        const realPathRelative = path.relative
        const pathRelativeSpy = jest.spyOn(path, 'relative')
        pathRelativeSpy.mockImplementation((from, to) => {
            const mockFs = {
                '/foo/bar/src': {
                    './src/index.js': 'index.js',
                },
                '/foo/bar': {
                    '/foo/bar/build/es/index.js': 'build/es/index.js',
                    '/foo/bar/build/cjs/index.js': 'build/cjs/index.js',
                },
            }
            return (
                (mockFs[from] && mockFs[from][to]) || realPathRelative(from, to)
            )
        })

        expect(
            await validatePackageExports(pkg, {
                config,
                paths,
                offerFix: false,
            })
        ).toBe(true)

        pathRelativeSpy.mockRestore()
    })

    // TODO: test offered fixes
})
