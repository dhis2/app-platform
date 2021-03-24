const { namespace, reporter } = require('@dhis2/cli-helpers-engine')
const i18n = require('../lib/i18n')
const makePaths = require('../lib/paths')

const generate = {
    description:
        'Generate JSON files compatible with i18next from po/pot files',
    builder: {
        namespace: {
            alias: 'n',
            description: 'Namespace for app locale separation',
            default: 'default',
        },
    },
    handler: async ({ cwd, namespace }) => {
        const paths = makePaths(cwd)

        const result = await i18n.generate({
            input: paths.i18nStrings,
            output: paths.i18nLocales,
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
    handler: async ({ cwd }) => {
        const paths = makePaths(cwd)

        const result = await i18n.extract({
            input: paths.src,
            output: paths.i18nStrings,
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
