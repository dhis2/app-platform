const path = require('path')
const { reporter } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const { craInit } = require('../shell')

// See https://github.com/facebook/create-react-app/issues/9849
function addMissingFieldsToPackageJson(appFolder) {
    const packageJsonPath = path.join(appFolder, 'package.json')
    const packageJsonRaw = fs.readFileSync(packageJsonPath, { encoding: 'utf8' })
    const packageJsonContents = JSON.parse(packageJsonRaw)
    const packageJsonPatched = {
        ...packageJsonContents,

        license: 'BSD-3-Clause',
        version: '1.0.0',
        scripts: {
            ...packageJsonContents.scripts,
            // remove eject script
            eject: undefined,
        },
    }
    const packageJsonPatchedString = JSON.stringify(packageJsonPatched, null, 4)

    fs.writeFileSync(packageJsonPath, packageJsonPatchedString)
}

module.exports = async function initApp({
    cwd: cwdArg,
    verbose,
    name,
}) {
    const cwd = cwdArg || process.cwd()
    const appFolder = path.join(cwd, name)

    reporter.info('Creating new dhis2 app...')

    await craInit({ name, cwd, verbose })

    addMissingFieldsToPackageJson(appFolder)

    reporter.info(
        `Successfully created the dhis2 app. You can now navigate to \`${appFolder}\` and run \`yarn start\``
    )

}
