const path = require('path')
const { reporter, chalk, exec } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const gitignore = require('parse-gitignore')
const makePaths = require('../lib/paths')

const ignorePatterns = ['node_modules', '.d2', 'src/locales', 'build']

const parseGitignore = gitignoreFile => {
    const newSection = { name: 'DHIS2 Platform', patterns: [] }
    if (fs.existsSync(gitignoreFile)) {
        const content = fs.readFileSync(gitignoreFile)
        const parsed = gitignore.parse(content)

        const existingSection = parsed.sections.filter(
            section => section.name === newSection.name
        )[0]

        if (existingSection) {
            newSection.patterns = existingSection.patterns
        }

        ignorePatterns.forEach(pattern => {
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
            patterns: parsed.patterns.filter(pattern => {
                if (
                    parsed.sections.some(section =>
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
    const format = section => {
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

const handler = async ({ force, name, cwd, lib }) => {
    cwd = cwd || process.cwd()
    cwd = path.join(cwd, name)
    fs.mkdirpSync(cwd)
    const paths = makePaths(cwd)

    if (fs.existsSync(paths.config) && !force) {
        reporter.warn(
            'A config file already exists, use --force to overwrite it'
        )
    } else {
        reporter.info('Importing d2.config.js defaults')
        fs.copyFileSync(
            lib ? paths.configDefaultsLib : paths.configDefaultsApp,
            paths.config
        )
    }

    if (!fs.existsSync(paths.package)) {
        reporter.info('No package.json found, creating one...')

        const pkg = require(path.join(
            __dirname,
            '../../config/init.package.json'
        ))
        pkg.name = name
        fs.writeJSONSync(paths.package, pkg, {
            spaces: 2,
        })
    }

    reporter.info('Creating package scripts...')
    const pkg = require(paths.package)
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
            cmd: 'yarn',
            args: ['add', '--dev', '@dhis2/cli-app-scripts'],
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
            cmd: 'yarn',
            args: ['add', '@dhis2/app-runtime'],
            cwd: paths.base,
        })
    }

    const entrypoint = lib ? 'src/index.js' : 'src/App.js'

    if (fs.existsSync(path.join(paths.base, entrypoint))) {
        reporter.warn(
            `An entrypoint file at ${entrypoint} already exists, remove it to create the sample entrypoint`
        )
    } else {
        reporter.info(`Creating entrypoint ${chalk.bold(entrypoint)}`)
        fs.mkdirpSync(path.join(paths.base, 'src'))
        fs.copyFileSync(
            path.join(__dirname, '../../config/init.entrypoint.js'),
            path.join(paths.base, entrypoint)
        )

        if (!lib) {
            fs.copyFileSync(
                path.join(__dirname, '../../config/init.App.test.js'),
                path.join(paths.base, 'src/App.test.js')
            )
            fs.copyFileSync(
                path.join(__dirname, '../../config/init.App.module.css'),
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
        fs.copyFileSync(paths.readmeDefault, paths.readme)
    }

    reporter.print('')
    reporter.info('SUCCESS!')
    const cdCmd = name != '.' ? `cd ${name} && ` : ''
    reporter.print(
        `Run ${chalk.bold(
            `${cdCmd}yarn start`
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
    },
    handler,
}

module.exports = command
