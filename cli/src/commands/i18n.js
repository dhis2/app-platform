const { namespace, reporter } = require('@dhis2/cli-helpers-engine')
const i18n = require('../lib/i18n')

const generate = {
    description:
        'Generate JSON files compatible with i18next from po/pot files',
    builder: {
        path: {
            alias: 'p',
            description:
                'directory path to find .po/.pot files and convert to JSON',
            default: './i18n/',
        },
        output: {
            alias: 'o',
            description: 'Output directory to place converted JSON files.',
            default: './src/locales/',
        },
        namespace: {
            alias: 'n',
            description: 'Namespace for app locale separation',
            default: 'default',
        },
    },
    handler: async argv => {
        const result = await i18n.generate({
            input: argv.path,
            output: argv.output,
            namespace: argv.namespace,
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
            default: './src/',
        },
        output: {
            alias: 'o',
            description: 'Destination path for en.pot file',
            default: './i18n/',
        },
    },
    handler: async argv => {
        const result = await i18n.extract({
            input: argv.path,
            output: argv.output,
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
