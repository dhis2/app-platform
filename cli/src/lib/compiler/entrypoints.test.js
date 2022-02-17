const { reporter } = require('@dhis2/cli-helpers-engine')
const { verifyEntrypoints } = require('./entrypoints.js')

jest.mock('@dhis2/cli-helpers-engine', () => ({
    chalk: {
        bold: (string) => string,
    },
    reporter: {
        error: jest.fn(),
    },
}))

describe('verifyEntrypoints', () => {
    it(`does not throw an error if an app's entrypoint is located in the 'src' directory`, () => {
        const resolveModule = jest.fn()

        const appConfig1 = {
            type: 'app',
            entryPoints: {
                app: './src/App.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig1,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()

        const appConfig2 = {
            type: 'app',
            entryPoints: {
                app: 'src/App.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig2,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
    })

    it(`throws an error if an app's entrypoint is not located in the 'src' directory`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                app: 'App.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
            })
        ).toThrow(
            `Entrypoint App.js must be located within the ./src directory`
        )
    })

    it(`does not throw an error if an app's entrypoint exists`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                app: './src/SomeApp.js',
            },
        }
        const resolveModule = jest.fn()

        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/SomeApp.js'
        )
    })

    it(`throws an error if an app's entrypoint does not exist`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                app: './src/SomeApp.js',
            },
        }
        const resolveModule = jest.fn((path) => {
            throw new Error(`Cannot find module '${path}'`)
        })

        const expectedError = 'Could not resolve entrypoint ./src/SomeApp.js'
        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).toThrow(expectedError)
        expect(reporter.error).toHaveBeenCalledWith(expectedError)
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/SomeApp.js'
        )
    })

    it(`does not throw an error if a library's entrypoint is located in the 'src' directory`, () => {
        const resolveModule = jest.fn()

        const libConfig1 = {
            type: 'lib',
            entryPoints: {
                lib: './src/index.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: libConfig1,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()

        const libConfig2 = {
            type: 'lib',
            entryPoints: {
                lib: 'src/index.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: libConfig2,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
    })

    it(`throws an error if a library's entrypoint is not located in the 'src' directory`, () => {
        const libConfig = {
            type: 'lib',
            entryPoints: {
                lib: 'index.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: libConfig,
                paths: {
                    base: '/the/base/path',
                },
            })
        ).toThrow(
            `Entrypoint index.js must be located within the ./src directory`
        )
    })

    it(`does not throw an error if a library's entrypoint exists`, () => {
        const libConfig = {
            type: 'lib',
            entryPoints: {
                lib: './src/index.js',
            },
        }
        const resolveModule = jest.fn()

        expect(() =>
            verifyEntrypoints({
                config: libConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/index.js'
        )
    })

    it(`throws an error if a library's entrypoint does not exist`, () => {
        const libConfig = {
            type: 'lib',
            entryPoints: {
                lib: './src/index.js',
            },
        }
        const resolveModule = jest.fn((path) => {
            throw new Error(`Cannot find module '${path}'`)
        })

        const expectedError = 'Could not resolve entrypoint ./src/index.js'
        expect(() =>
            verifyEntrypoints({
                config: libConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).toThrow(expectedError)
        expect(reporter.error).toHaveBeenCalledWith(expectedError)
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/index.js'
        )
    })

    it('supports multiple library entrypoints', () => {
        const libConfig = {
            type: 'lib',
            entryPoints: {
                lib: {
                    '.': './src/index.js',
                    './subpackage': './src/subpackage/index.js',
                    'conditional-export': {
                        '.': './src/index.node.js',
                    },
                },
            },
        }
        const resolveModule = jest.fn()

        expect(() =>
            verifyEntrypoints({
                config: libConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/index.js'
        )
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/subpackage/index.js'
        )
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/index.node.js'
        )
        expect(resolveModule).toHaveBeenCalledTimes(3)
    })

    it(`does not throw an error if a plugin's entrypoint is located in the 'src' directory`, () => {
        const resolveModule = jest.fn()

        const appConfig1 = {
            type: 'app',
            entryPoints: {
                plugin: './src/plugin.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig1,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()

        const appConfig2 = {
            type: 'app',
            entryPoints: {
                plugin: 'src/plugin.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig2,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
    })

    it(`throws an error if a plugin's entrypoint is not located in the 'src' directory`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                plugin: 'plugin.js',
            },
        }
        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
            })
        ).toThrow(
            `Entrypoint plugin.js must be located within the ./src directory`
        )
    })

    it(`does not throw an error if a plugin's entrypoint exists`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                plugin: './src/plugin.js',
            },
        }
        const resolveModule = jest.fn()

        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).not.toThrow()
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/plugin.js'
        )
    })

    it(`throws an error if a plugin's entrypoint does not exist`, () => {
        const appConfig = {
            type: 'app',
            entryPoints: {
                plugin: './src/plugin.js',
            },
        }
        const resolveModule = jest.fn(path => {
            throw new Error(`Cannot find module '${path}'`)
        })

        const expectedError = 'Could not resolve entrypoint ./src/plugin.js'
        expect(() =>
            verifyEntrypoints({
                config: appConfig,
                paths: {
                    base: '/the/base/path',
                },
                resolveModule,
            })
        ).toThrow(expectedError)
        expect(reporter.error).toHaveBeenCalledWith(expectedError)
        expect(resolveModule).toHaveBeenCalledWith(
            '/the/base/path/src/plugin.js'
        )
    })

    it(`throws an error if an app does not define any entrypoints`, () => {
        const resolveModule = jest.fn()
        const paths = {
            base: '/the/base/path',
        }

        const appConfig1 = {
            type: 'app',
            entryPoints: {},
        }
        const appConfig2 = {
            type: 'app',
            entryPoints: undefined,
        }

        const expectedAppError = 'Apps must define an app or plugin entrypoint'
        expect(() =>
            verifyEntrypoints({
                config: appConfig1,
                paths,
                resolveModule,
            })
        ).toThrow(expectedAppError)
        expect(() =>
            verifyEntrypoints({
                config: appConfig2,
                paths,
                resolveModule,
            })
        ).toThrow(expectedAppError)

        const libConfig1 = {
            type: 'lib',
            entryPoints: {},
        }
        const libConfig2 = {
            type: 'lib',
            entryPoints: undefined,
        }

        const expectedLibError = 'Libraries must define a lib entrypoint'
        expect(() =>
            verifyEntrypoints({
                config: libConfig1,
                paths,
                resolveModule,
            })
        ).toThrow(expectedLibError)
        expect(() =>
            verifyEntrypoints({
                config: libConfig2,
                paths,
                resolveModule,
            })
        ).toThrow(expectedLibError)
    })
})
