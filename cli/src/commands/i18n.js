const { namespace, reporter } = require('@dhis2/cli-helpers-engine')
const i18n = require('../lib/i18n')
const makePaths = require('../lib/paths')

process.on('unhandledRejection', err => {
    throw err
})

const generate = {
    description:
        'Generate JSON files compatible with i18next from po/pot files',
    builder: {
        path: {
            alias: 'p',
            description:
                'directory path to find .po/.pot files and convert to JSON',
        },
        output: {
            alias: 'o',
            description: 'Output directory to place converted JSON files.',
        },
        namespace: {
            alias: 'n',
            description: 'Namespace for app locale separation',
            default: 'default',
        },
    },
    handler: async ({ cwd, path, output, namespace }) => {
        const paths = makePaths(cwd)

        const result = await i18n.generate({
            input: path || paths.i18nStrings,
            output: output || paths.i18nLocales,
            namespace,
            paths,
        })

        if (!result) {
            reporter.error('Failed to generate i18n code.')
            process.exit(1)
        }
        reporter.info(`Done!`)
    },
}
const extract = {
    description: 'Extract strings-to-translate',
    builder: {
        path: {
            alias: 'p',
            description:
                'Directory path to recurse and extract i18n.t translation strings',
        },
        output: {
            alias: 'o',
            description: 'Destination path for en.pot file',
        },
    },
    handler: async ({ cwd, path, output }) => {
        const paths = makePaths(cwd)

        const result = await i18n.extract({
            input: path || paths.src,
            output: output || paths.i18nStrings,
            paths,
        })
        if (!result) {
            reporter.error('Failed to extract i18n strings.')
            process.exit(1)
        }
        reporter.info(`Done!`)
    },
}

module.exports = namespace('i18n', {
    description: 'Extract i18n.t translation strings from DHIS2 frontend apps',
    commands: {
        extract,
        generate,
    },
})
