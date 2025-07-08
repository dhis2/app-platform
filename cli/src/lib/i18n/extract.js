const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { i18nextToPot, gettextToI18next } = require('i18next-conv')
const scanner = require('i18next-scanner')
const parseConfig = require('../parseConfig')
const { checkDirectoryExists, walkDirectory, arrayEqual } = require('./helpers')

const extract = async ({ input, output, paths, isApp }) => {
    const relativeInput = './' + path.relative(paths.base, input)
    if (!checkDirectoryExists(input)) {
        reporter.error(
            `I18n source directory ${chalk.bold(relativeInput)} does not exist.`
        )
        return false
    }

    reporter.debug(`[i18n-extract] Reading ${chalk.bold(relativeInput)}...`)

    const files = walkDirectory(input)
    if (files.length === 0) {
        reporter.error(
            `Directory ${chalk.bold(relativeInput)} has no files to translate.`
        )
        process.exit(1)
    }

    /* eslint-disable max-params */
    var parser = new scanner.Parser({
        keepRemoved: false,
        keySeparator: false,
        sort: true,
        defaultValue: (lng, ns, key, options) =>
            options.defaultValue ? options.defaultValue : key,
    })
    /* eslint-enable max-params */

    reporter.debug(`[i18n-extract] Parsing ${files.length} files...`)

    files.forEach((filePath) => {
        var contents = fs.readFileSync(filePath, 'utf8')
        parser.parseFuncFromString(contents).get()
    })

    var parsed = parser.get()
    var en = {}
    Object.keys(parsed.en.translation).forEach(
        (str) => (en[str] = parsed.en.translation[str])
    )

    /**
     * Here we add some strings to the pot file based on the d2 config. These are prefixed with __MANIFEST to minimise the chance of collison with other strings, and suffixed with a context string that helps translators know what the key refers to
     *
     * The pot file ends up with fields like:
     *
     *
     * msgctxt "Application title"
     * msgid "__MANIFEST_APP_TITLE"
     * msgstr "App Management"
     *
     * msgctxt "Application description"
     * msgid "__MANIFEST_APP_DESCRIPTION"
     * msgstr ""
     * "The Application Management App provides .."
     *
     * msgctxt "Title for shortcut used by command palette"
     * msgid "__MANIFEST_SHORTCUT_Apps Home"
     * msgstr "Apps Home"
     */
    if (isApp) {
        try {
            reporter.debug(
                'Extracting manifest strings (title, description and shortcuts) for translation'
            )
            const configContents = parseConfig(paths)
            en['__MANIFEST_APP_TITLE_Application title'] = configContents.title
            en['__MANIFEST_APP_DESCRIPTION_Application description'] =
                configContents.description
            configContents.shortcuts?.forEach((shortcut) => {
                en[
                    `__MANIFEST_SHORTCUT_${shortcut?.name}_Title for shortcut used by command palette`
                ] = shortcut?.name
            })
        } catch (err) {
            reporter.warn('error extracting manifest translations strings')
            reporter.warn(err)
        }
    }

    if (Object.keys(en).length === 0) {
        reporter.print(
            chalk.dim(
                `No translatable strings found in directory ${chalk.bold(
                    relativeInput
                )}`
            )
        )
        return true
    }

    var targetPath = path.join(output, 'en.pot')

    if (fs.existsSync(targetPath)) {
        // validate, diff translation keys b/w en.pot vs now
        const content = fs.readFileSync(targetPath, 'utf8')
        const json = await gettextToI18next('en', content)

        var msgIds = Object.keys(en)
        var newMsgIds = Object.keys(JSON.parse(json))

        if (arrayEqual(newMsgIds, msgIds)) {
            reporter.print(chalk.dim('No i18n updates found!'))
            return true
        }
    }

    reporter.print(
        chalk.dim(
            `Writing ${Object.keys(en).length} language strings to ${chalk.bold(
                './' + path.relative(paths.base, targetPath)
            )}...`
        )
    )
    const result = await i18nextToPot('en', JSON.stringify(en))

    fs.ensureFileSync(targetPath)
    fs.writeFileSync(targetPath, result + '\n')
    reporter.debug('[i18n-extract] complete')
    return true
}

module.exports = extract
