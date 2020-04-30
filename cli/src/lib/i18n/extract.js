const fs = require('fs-extra')
const path = require('path')
const { checkDirectoryExists, walkDirectory, arrayEqual } = require('./helpers')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const scanner = require('i18next-scanner')
const { i18nextToPot, gettextToI18next } = require('i18next-conv')

const extract = async ({ input, output }) => {
    const relativeInput = './' + path.relative(process.cwd(), input)
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

    var parser = new scanner.Parser({
        keepRemoved: false,
        keySeparator: false,
        sort: true,
    })

    reporter.debug(`[i18n-extract] Parsing ${files.length} files...`)

    files.forEach(filePath => {
        var contents = fs.readFileSync(filePath, 'utf8')
        parser.parseFuncFromString(contents).get()
    })

    var parsed = parser.get()
    var en = {}
    Object.keys(parsed.en.translation)
        .forEach(str => (en[str] = parsed.en.translation[str]))

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
                './' + targetPath
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
