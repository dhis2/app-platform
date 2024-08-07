const fs = require('fs/promises')
const path = require('path')
const { reporter /* chalk */ } = require('@dhis2/cli-helpers-engine')
const fg = require('fast-glob')

// Looks for JSX syntax; avoids comments
// Known false positives: in strings or multiline comments (see regex101)
// https://regex101.com/r/YDkml7/5
const jsxRegex = /^(?![ \t]*(?:\/\/|\/?\*+)).*(<\/?[a-zA-Z]+[^>]*>)/gim

// Looks for relative import statements
// https://regex101.com/r/xsHZdQ/3
const importRegex = /(import.*|from) ['"](\..*)['"]/gim

// https://regex101.com/r/u5vIVb/1
const hasFileExtensionRegex = /[^/]*\.[^/]*$/

const handler = async () => {
    const globMatches = await fg.glob('src/**/*.js')

    // 1. Search each file for JSX syntax
    // If found, 1) add to Set and 2) rename file (add 'x' to end)
    const renamedFiles = new Set()
    await Promise.all(
        globMatches.map(async (matchPath) => {
            const contents = await fs.readFile(matchPath, {
                encoding: 'utf8',
            })
            if (!contents) {
                return
            }

            if (contents.match(jsxRegex)) {
                const newPath = matchPath.concat('x') // Add 'x' to the end to make it 'jsx'
                reporter.debug(`Renaming ${matchPath} to ${newPath}`)

                await fs.rename(matchPath, newPath)
                renamedFiles.add(matchPath)
            }
        })
    )
    reporter.info(`Renamed ${renamedFiles.size} file(s)`)

    // 2. Go through each file again for imports
    // (Run glob again because some files have been renamed)
    // If there's a local file import, check to see if it matches
    // a renamed item in the set. If so, rewrite the new extension
    // (Note: Files without extension aren't edited; Vite and TS
    // handle them, so it's up to eslint rules)
    const globMatches2 = await fg.glob('src/**/*.(js|jsx)')
    let fileUpdatedCount = 0
    await Promise.all(
        globMatches2.map(async (matchPath) => {
            const fileContent = await fs.readFile(matchPath, {
                encoding: 'utf8',
            })

            let newFileContent = fileContent
            let contentUpdated = false
            const importMatches = Array.from(fileContent.matchAll(importRegex))
            importMatches.forEach((match) => {
                // get the second capturing group, the import path
                const importPath = match[2]
                const importPathWithExtension = hasFileExtensionRegex.test(
                    importPath
                )
                    ? importPath
                    : importPath + '.js'
                // get the full path of the imported file from the repo root
                const importPathFromRoot = path.join(
                    matchPath,
                    '..',
                    importPathWithExtension
                )
                const isRenamed = renamedFiles.has(importPathFromRoot)

                // todo: 'updateImportsWithoutFileExtensions' option

                if (isRenamed) {
                    // replacing the whole matched string ends up being more
                    // precise and avoids side effects
                    const newMatchContent = match[0].replace(
                        importPath,
                        importPathWithExtension + 'x'
                    )
                    newFileContent = newFileContent.replace(
                        match[0],
                        newMatchContent
                    )
                    contentUpdated = true
                }
            })

            if (contentUpdated) {
                await fs.writeFile(matchPath, newFileContent)
                fileUpdatedCount += 1
            }
        })
    )
    if (fileUpdatedCount > 0) {
        reporter.info(`Updated imports in ${fileUpdatedCount} file(s)`)
    }

    // 3. Update d2.config.js
    // Read d2 config as JS for easier access to entryPoint strings
    const d2ConfigPath = path.join(process.cwd(), './d2.config.js')
    const { entryPoints } = require(d2ConfigPath)
    const d2ConfigContents = await fs.readFile(d2ConfigPath, {
        encoding: 'utf8',
    })
    let newD2ConfigContents = d2ConfigContents
    let configContentUpdated = false
    Object.values(entryPoints).forEach((entryPoint) => {
        // entryPoint is formatted as './src/...' -- drop first 2 chars
        // to match the glob format above
        if (renamedFiles.has(entryPoint.substring(2))) {
            newD2ConfigContents = newD2ConfigContents.replace(
                entryPoint,
                entryPoint + 'x'
            )
            configContentUpdated = true
        }
    })
    if (configContentUpdated) {
        await fs.writeFile(d2ConfigPath, newD2ConfigContents)
        reporter.info('Updated d2.config.js entrypoints')
    }
}

const command = {
    command: 'jsx-migration',
    desc: 'Renames .js files to .jsx -- also handles file imports and d2.config.js',
    builder: {
        // todo: update parameters
        username: {
            alias: 'u',
            description:
                'The username for authenticating with the DHIS2 instance',
        },
        timeout: {
            description:
                'The timeout (in seconds) for uploading the app bundle',
            default: 300,
        },
    },
    handler,
}

module.exports = command
