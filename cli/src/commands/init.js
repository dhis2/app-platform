const path = require('path')
const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const gitignore = require('parse-gitignore')
const makePaths = require('../lib/paths')

const ignorePatterns = ['node_modules', '.d2', 'src/locales', 'build']

const parseGitignore = (gitignoreFile) => {
    const newSection = { name: 'DHIS2 Platform', patterns: [] }
    if (fs.existsSync(gitignoreFile)) {
        const content = fs.readFileSync(gitignoreFile)
        const parsed = gitignore.parse(content)

        const existingSection = parsed.sections.filter(
            (section) => section.name === newSection.name
        )[0]

        if (existingSection) {
            newSection.patterns = existingSection.patterns
        }

        ignorePatterns.forEach((pattern) => {
            if (!parsed.patterns.includes(pattern)) {
                newSection.patterns.push(pattern)
            }
        })

        if (existingSection) {
            existingSection.patterns = newSection.patterns
        } else {
            if (newSection.patterns.length) {
                parsed.sections.push(newSection)
            }
        }

        const defaultSection = {
            name: null,
            patterns: parsed.patterns.filter((pattern) => {
                if (
                    parsed.sections.some((section) =>
                        section.patterns.includes(pattern)
                    )
                ) {
                    return false
                }
                return true
            }),
        }
        parsed.sections.unshift(defaultSection)

        return parsed.sections
    }

    newSection.patterns = ignorePatterns
    return [newSection]
}

const writeGitignore = (gitignoreFile, sections) => {
    const format = (section) => {
        if (section.name === null && section.patterns.length) {
            return section.patterns.join('\n') + '\n\n'
        }
        if (section.patterns.length) {
            return gitignore.format(section)
        }
        return ''
    }
    fs.writeFileSync(gitignoreFile, gitignore.stringify(sections, format))
}

const handler = async ({ force, pnpm, npm, name, cwd, lib, typeScript }) => {
    const installCmd = npm ? 'install' : 'add'
    let pkgManager = 'yarn'
    if (pnpm) {
        pkgManager = 'pnpm'
    } else if (npm) {
        pkgManager = 'npm'
    }

    // create the folder where the template will be generated
    cwd = cwd || process.cwd()
    cwd = path.join(cwd, name)
    fs.mkdirpSync(cwd)
    const paths = makePaths(cwd, { typeScript })

    reporter.info('checking d2.config exists')
    if (fs.existsSync(paths.config) && !force) {
        reporter.warn(
            'A config file already exists, use --force to overwrite it'
        )
    } else {
        reporter.info('Importing d2.config defaults')
        fs.copyFileSync(
            lib ? paths.initConfigLib : paths.initConfigApp,
            paths.config
        )
        reporter.debug(' copied default d2.config')
    }

    if (!fs.existsSync(paths.package)) {
        reporter.info('No package.json found, creating one...')

        const pkg = require(paths.initPackageJson)
        pkg.name = name
        fs.writeJSONSync(paths.package, pkg, {
            spaces: 2,
        })
    }

    reporter.info('Creating package scripts...')
    const pkg = fs.readJsonSync(paths.package)
    if (pkg.scripts && pkg.scripts.build && !force) {
        reporter.warn(
            'A script called "build" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.build = 'd2-app-scripts build'
    }

    if (pkg.scripts && pkg.scripts.start && !force) {
        reporter.warn(
            'A script called "start" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.start = 'd2-app-scripts start'
    }

    if (pkg.scripts && pkg.scripts.test && !force) {
        reporter.warn(
            'A script called "test" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.test = 'd2-app-scripts test'
    }

    if (pkg.scripts && pkg.scripts.deploy && !force) {
        reporter.warn(
            'A script called "deploy" already exists, use --force to overwrite it'
        )
    } else {
        pkg.scripts = pkg.scripts || {}
        pkg.scripts.deploy = 'd2-app-scripts deploy'
    }

    fs.writeJSONSync(paths.package, pkg, {
        spaces: 2,
    })

    if (pnpm) {
        fs.copySync(paths.initPnpmWorkspace, paths.pnpmWorkspace)
    }

    if (
        !force &&
        ((pkg.devDependencies &&
            Object.keys(pkg.devDependencies).includes(
                '@dhis2/cli-app-scripts'
            )) ||
            (pkg.dependencies &&
                Object.keys(pkg.dependencies).includes(
                    '@dhis2/cli-app-scripts'
                )))
    ) {
        reporter.warn(
            'A version of `@dhis2/cli-app-scripts` is already listed as a dependency, use --force to overwrite it'
        )
    } else {
        reporter.info('Installing @dhis2/cli-app-scripts...')
        await exec({
            cmd: pkgManager,
            args: [installCmd, 'react@^18'],
            cwd: paths.base,
        })

        await exec({
            cmd: pkgManager,
            args: [installCmd, 'react-dom@^18'],
            cwd: paths.base,
        })

        await exec({
            cmd: pkgManager,
            args: [installCmd, '-D', '@dhis2/cli-app-scripts@alpha'], // todo: update to alpha/main channel
            cwd: paths.base,
        })
    }

    if (
        !force &&
        ((pkg.dependencies &&
            Object.keys(pkg.dependencies).includes('@dhis2/app-runtime')) ||
            (pkg.peerDependencies &&
                Object.keys(pkg.peerDependencies).includes(
                    '@dhis2/app-runtime'
                )))
    ) {
        reporter.warn(
            'A version of `@dhis2/app-runtime` is already listed as a dependency, use --force to overwrite it'
        )
    } else {
        reporter.info('Installing @dhis2/app-runtime...')
        await exec({
            cmd: pkgManager,
            args: [installCmd, '@dhis2/app-runtime'],
            cwd: paths.base,
        })
    }

    if (typeScript) {
        // copy tsconfig
        reporter.info('Copying tsconfig')
        fs.copyFileSync(paths.initTSConfig, paths.tsConfig)

        reporter.info('install TypeScript as a dev dependency')

        await exec({
            cmd: pkgManager,
            args: [installCmd, 'typescript@^5', '-D'],
            cwd: paths.base,
        })

        // install any other TS dependencies needed
        reporter.info('install type definitions')
        await exec({
            cmd: pkgManager,
            args: [
                installCmd,
                '@types/react @types/react-dom @types/jest',
                '-D',
            ],
            cwd: paths.base,
        })

        // add global.d.ts to get rid of CSS module errors
        // something like https://github.com/dhis2/data-exchange-app/pull/79/files#diff-858566d2d4cf06579a908cb85f587c5752fa0fa6a47d579277749006e86f0834
        // (but maybe something better)
        // also look at copying src/custom.d.ts https://github.com/dhis2/data-exchange-app/pull/79/files#diff-5f2ca1b1541dc3023f81543689da349e59b97c708462dd8da4640b399362edc7
        reporter.info('add declaration files')
        const typesDir = path.join(paths.base, 'types')

        if (!fs.existsSync(typesDir)) {
            fs.mkdirpSync(typesDir)
        }
        fs.copyFileSync(
            paths.initGlobalDeclaration,
            path.join(typesDir, 'global.d.ts')
        )
        fs.copyFileSync(
            paths.initModulesDeclaration,
            path.join(typesDir, 'modules.d.ts')
        )
    }

    const extension = typeScript ? 'ts' : 'js'

    const entrypoint = lib ? `src/index.${extension}x` : `src/App.${extension}x`

    if (fs.existsSync(path.join(paths.base, entrypoint))) {
        reporter.warn(
            `An entrypoint file at ${entrypoint} already exists, remove it to create the sample entrypoint`
        )
    } else {
        reporter.info(`Creating entrypoint ${chalk.bold(entrypoint)}`)
        fs.mkdirpSync(path.join(paths.base, 'src'))
        fs.copyFileSync(paths.initEntrypoint, path.join(paths.base, entrypoint))

        if (!lib) {
            fs.copyFileSync(
                paths.initAppTestJsx,
                path.join(paths.base, `src/App.test.${extension}x`)
            )
            fs.copyFileSync(
                paths.initAppModuleCss,
                path.join(paths.base, 'src/App.module.css')
            )
        }
    }

    const gitignoreFile = path.join(paths.base, '.gitignore')
    reporter.info('Updating .gitignore...')
    const sections = parseGitignore(gitignoreFile)
    writeGitignore(gitignoreFile, sections)

    if (fs.existsSync(paths.readme) && !force) {
        reporter.warn('A README already exists, use --force to overwrite it')
    } else {
        reporter.info('Writing README...')
        fs.copyFileSync(paths.initReadme, paths.readme)
    }

    reporter.print('')
    reporter.info('SUCCESS!')
    const cdCmd = name != '.' ? `cd ${name} && ` : ''
    reporter.print(
        `Run ${chalk.bold(
            `${cdCmd}${pkgManager} start`
        )} to launch your new DHIS2 application`
    )
}

const command = {
    command: 'init <name>',
    desc: 'Setup an app ',
    builder: {
        force: {
            description: 'Overwrite existing files and configurations',
            type: 'boolean',
            default: false,
        },
        lib: {
            description: 'Create a library',
            type: 'boolean',
            default: false,
        },
        typeScript: {
            alias: ['typescript', 'ts'],
            description: 'Use TypeScript template',
            type: 'boolean',
            default: false,
        },
        pnpm: {
            description:
                'Use pnpm (instead of the default yarn 1) as a Package manager',
            type: 'boolean',
            default: false,
        },
        npm: {
            description:
                'Use npm (instead of the default yarn 1) as a Package manager',
            type: 'boolean',
            default: false,
            conflicts: 'pnpm',
        },
    },
    handler,
}

module.exports = command
