const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const handlebars = require('handlebars')
const { gettextToI18next } = require('i18next-conv')
const { checkDirectoryExists } = require('./helpers')
const { langToLocale } = require('./locales')

const writeTemplate = (outFile, data) => {
    const localesHBS = fs.readFileSync(
        path.join(__dirname, 'templates', 'locales.hbs'),
        'utf8'
    )
    const localesTemplate = handlebars.compile(localesHBS)
    fs.writeFileSync(outFile, localesTemplate(data))
}

const generate = async ({ input, output, namespace, paths }) => {
    if (!checkDirectoryExists(input)) {
        const relativeInput = './' + path.relative(paths.base, input)
        reporter.debug(
            `Source directory ${chalk.bold(
                relativeInput
            )} does not exist, skipping i18n generation`
        )
        return false
    }

    // clean-up and create destination dir.
    const dst = path.normalize(output)
    fs.removeSync(dst)
    fs.ensureDirSync(dst)

    reporter.debug(`[i18n-generate] Reading translation sources...`)
    const files = fs.readdirSync(input)

    const langs = files.map((f) => path.basename(f, path.extname(f)))
    const locales = langs
        .filter((lang) => lang !== 'en')
        .map((lang) => langToLocale[lang])

    const outFile = path.join(dst, 'index.js')
    writeTemplate(outFile, { locales, langs, namespace })

    reporter.debug(`[i18n-generate] Generating translation .json files...`)

    const manifestTranslations = []
    const promises = files.map(async (f) => {
        const ext = path.extname(f)
        const lang = path.basename(f, ext)

        reporter.debug(
            `[i18n-generate] Writing JSON translation file for language: ${lang}...`
        )

        if (ext === '.po' || ext === '.pot') {
            const filePath = path.join(input, f)
            const contents = fs.readFileSync(filePath, 'utf8')
            const json = await gettextToI18next(lang, contents)

            const target = path.join(dst, lang)
            fs.ensureDirSync(target)

            const translationsPath = path.join(target, 'translations.json')
            fs.writeFileSync(translationsPath, json, { encoding: 'utf8' })

            /**
             * Generating the manifest translation strings that will end up in build/app/manifest.webapp.translations.json
             * and will be consumed by the backend to translate shortcuts and other app-related fields
             *
             * The output is an array of objects that look like this (format mainly to be easily consumed in Java side):
             * @example [
             *  {
             *      "locale": "en",
             *      "translations": {
             *          "APP_TITLE": "App Management",
             *          "APP_DESCRIPTION": "The Application Management App provides the ability to upload webapps in .zip files, as well as installing apps directly from the official DHIS 2 App Store",
             *          "SHORTCUT_Apps Home": "Apps Home",
             *          "SHORTCUT_App hub": "App hub"
             * },
             * // other locales
             * ]
             */
            const manifestTranslation = {
                locale: lang,
                translations: {},
            }

            try {
                for (const [key, value] of Object.entries(JSON.parse(json))) {
                    if (key.match(/__MANIFEST_/)) {
                        // removing the initial prefix and the context description at the end of the key
                        const keyCleaned = key
                            ?.replace(/__MANIFEST_/, '')
                            .replace(/_[^_]+$/, '')
                        manifestTranslation.translations[keyCleaned] = value
                    }
                }
            } catch (err) {
                reporter.warn(
                    'error generating manifest.webapp.translations.json'
                )
                reporter.warn(err)
            }

            manifestTranslations.push(manifestTranslation)
        }
    })

    await Promise.all(promises)

    return { manifestTranslations }
}

module.exports = generate
