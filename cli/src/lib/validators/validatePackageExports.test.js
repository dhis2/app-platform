const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const { validatePackageExports } = require('./validatePackageExports')

jest.mock('@dhis2/cli-helpers-engine', () => ({
    reporter: {
        warn: jest.fn(),
    },
}))

describe('validatePackageExports', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('returns true for apps', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'app',
                },
            })
        ).toBe(true)
    })

    it('returns true if no library entrypoint is defined', async () => {
        expect(
            await validatePackageExports(null, {
                config: {
                    type: 'lib',
                    entryPoints: {},
                },
            })
        ).toBe(true)
    })

    it('validates package.json exports when a single library entrypoint is defined', async () => {
        const config = {
            type: 'lib',
            entryPoints: {
                lib: './src/index.js',
            },
        }
        const possiblePkgs = [
            {
                main: './build/cjs/index.js',
                module: './build/es/index.js',
                exports: {
                    require: './build/cjs/index.js',
                    import: './build/es/index.js',
                },
            },
            {
                main: './build/cjs/index.js',
                module: './build/es/index.js',
                exports: './build/es/index.js',
            },
            {
                main: './build/cjs/index.js',
                module: './build/es/index.js',
                exports: {
                    '.': {
                        require: './build/cjs/index.js',
                        import: './build/es/index.js',
                    },
                },
            },
        ]
        const incorrectPkgs = [
            {
                warning:
                    'Invalid "main" field in package.json, expected "./build/cjs/index.js" (got "./build/es/index.js")',
                pkg: {
                    main: './build/es/index.js',
                    module: './build/es/index.js',
                    exports: {
                        require: './build/cjs/index.js',
                        import: './build/es/index.js',
                    },
                },
            },
            {
                warning: 'package.json is missing "exports" field',
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                },
            },
            {
                warning:
                    'Invalid "exports" field in package.json, expected "./build/cjs/index.js" or "./build/es/index.js" (got "./incorrect.js")',
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                    exports: './incorrect.js',
                },
            },
            {
                warning: `Invalid "exports['.'].require" field in package.json, expected "./build/cjs/index.js" (got "./build/es/index.js")`,
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                    exports: {
                        '.': {
                            require: './build/es/index.js',
                            import: './build/es/index.js',
                        },
                    },
                },
            },
        ]

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

        for (const pkg of possiblePkgs) {
            expect(
                await validatePackageExports(pkg, {
                    config,
                    paths,
                    offerFix: false,
                })
            ).toBe(true)
            expect(reporter.warn).toHaveBeenCalledTimes(0)
        }

        for (const { pkg, warning } of incorrectPkgs) {
            expect(
                await validatePackageExports(pkg, {
                    config,
                    paths,
                    offerFix: false,
                })
            ).toBe(false)
            expect(reporter.warn).toHaveBeenLastCalledWith(warning)
        }

        pathRelativeSpy.mockRestore()
    })

    it('validates package.json exports when multiple library entrypoints are defined', async () => {
        const config = {
            type: 'lib',
            entryPoints: {
                lib: {
                    '.': {
                        browser: './src/index.js',
                        worker: './src/index.worker.js',
                    },
                    './subpackage': {
                        node: './src/subpackage.node.js',
                        default: './src/subpackage.js',
                    },
                },
            },
        }
        const pkg = {
            main: './build/cjs/index.js',
            module: './build/es/index.js',
            exports: {
                '.': {
                    browser: {
                        require: './build/cjs/index.js',
                        import: './build/es/index.js',
                    },
                    worker: {
                        require: './build/cjs/index.worker.js',
                        import: './build/es/index.worker.js',
                    },
                },
                './subpackage': {
                    node: {
                        require: './build/cjs/subpackage.node.js',
                        import: './build/es/subpackage.node.js',
                    },
                    default: {
                        require: './build/cjs/subpackage.js',
                        import: './build/es/subpackage.js',
                    },
                },
            },
        }
        const incorrectPkgs = [
            {
                warning:
                    'The "exports" field cannot be a string if multiple entrypoints are defined',
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                    exports: './build/cjs/index.js',
                },
            },
            {
                warning: 'package.json is missing "exports" field',
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                },
            },
            {
                warning: `Invalid "exports['.']['browser'].require" field in package.json, expected "./build/cjs/index.js" (got "./incorrect.js")`,
                pkg: {
                    main: './build/cjs/index.js',
                    module: './build/es/index.js',
                    exports: {
                        '.': {
                            browser: {
                                require: './incorrect.js',
                                import: './build/es/index.js',
                            },
                            worker: {
                                require: './build/cjs/index.worker.js',
                                import: './build/es/index.worker.js',
                            },
                        },
                        './subpackage': {
                            node: {
                                require: './build/cjs/subpackage.node.js',
                                import: './build/es/subpackage.node.js',
                            },
                            default: {
                                require: './build/cjs/subpackage.js',
                                import: './build/es/subpackage.js',
                            },
                        },
                    },
                },
            },
        ]

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
                    './src/index.worker.js': 'index.worker.js',
                    './src/subpackage.js': 'subpackage.js',
                    './src/subpackage.node.js': 'subpackage.node.js',
                },
                '/foo/bar': {
                    '/foo/bar/build/es/index.js': 'build/es/index.js',
                    '/foo/bar/build/cjs/index.js': 'build/cjs/index.js',
                    '/foo/bar/build/es/index.worker.js':
                        'build/es/index.worker.js',
                    '/foo/bar/build/cjs/index.worker.js':
                        'build/cjs/index.worker.js',
                    '/foo/bar/build/es/subpackage.js': 'build/es/subpackage.js',
                    '/foo/bar/build/cjs/subpackage.js':
                        'build/cjs/subpackage.js',
                    '/foo/bar/build/es/subpackage.node.js':
                        'build/es/subpackage.node.js',
                    '/foo/bar/build/cjs/subpackage.node.js':
                        'build/cjs/subpackage.node.js',
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
        expect(reporter.warn).toHaveBeenCalledTimes(0)

        for (const { pkg, warning } of incorrectPkgs) {
            expect(
                await validatePackageExports(pkg, {
                    config,
                    paths,
                    offerFix: false,
                })
            ).toBe(false)
            expect(reporter.warn).toHaveBeenLastCalledWith(warning)
        }

        pathRelativeSpy.mockRestore()
    })
})
