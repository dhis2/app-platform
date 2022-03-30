const extract = require('./extract.js')
const generate = require('./generate.js')

module.exports = async function extractAndGenerate(paths) {
    await extract({
        input: paths.src,
        output: paths.i18nStrings,
        paths,
    })

    await generate({
        input: paths.i18nStrings,
        output: paths.i18nLocales,
        namespace: 'default',
        paths,
    })
}
