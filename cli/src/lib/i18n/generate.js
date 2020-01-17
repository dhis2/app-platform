const fs = require('fs-extra')
const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const { gettextToI18next } = require('i18next-conv')
const handlebars = require('handlebars')

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

const generate = async ({ input, output, namespace }) => {
    if (!checkDirectoryExists(input)) {
        const relativeInput = './' + path.relative(process.cwd(), input)
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

    const langs = files.map(f => path.basename(f, path.extname(f)))
    const locales = langs
        .filter(lang => lang !== 'en')
        .map(lang => langToLocale[lang])

    const outFile = path.join(dst, 'index.js')
    writeTemplate(outFile, { locales, langs, namespace })

    reporter.debug(`[i18n-generate] Generating translation .json files...`)
    const promises = files.map(async f => {
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
        }
    })

    await Promise.all(promises)
    return true
}

module.exports = generate
