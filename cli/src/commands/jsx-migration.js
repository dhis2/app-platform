const fs = require('fs/promises')
const path = require('path')
const babel = require('@babel/core')
const { reporter /* chalk */ } = require('@dhis2/cli-helpers-engine')
const fg = require('fast-glob')

const babelParseOptions = {
    // could just use jsx syntax parser, but this is already a dep of CLI
    presets: ['@babel/preset-react'],
    // just need syntax parser here
    plugins: ['@babel/plugin-syntax-flow'],
}

const isJsxInFile = async (filepath) => {
    const code = await fs.readFile(filepath, { encoding: 'utf8' })
    try {
        const ast = await babel.parseAsync(code, babelParseOptions)

        let isJsx = false
        babel.traverse(ast, {
            // Triggers for any JSX-type node (JSXElement, JSXAttribute, etc)
            JSX: (path) => {
                isJsx = true
                path.stop() // done here; stop traversing
            },
        })

        return isJsx
    } catch (err) {
        console.log(err)
        return false
    }
}

const renameFile = async (filepath) => {
    const newPath = filepath.concat('x') // Add 'x' to the end to make it 'jsx'
    reporter.debug(`Renaming ${filepath} to ${newPath}`)
    await fs.rename(filepath, newPath)
}

const updateImports = async ({
    filepath,
    renamedFiles,
    skipUpdatingImportsWithoutExtension,
}) => {
    const code = await fs.readFile(filepath, { encoding: 'utf8' })
    reporter.debug(`Parsing ${filepath}`)

    try {
        const ast = await babel.parseAsync(code, babelParseOptions)

        let newCode = code
        let contentUpdated = false
        babel.traverse(ast, {
            ImportDeclaration: (astPath) => {
                const importSource = astPath.node.source.value
                if (!importSource.startsWith('.')) {
                    return // not a relative import
                }

                // This is a little weird for files with an extension other
                // than .js, but it's okay since they won't need updating
                const importSourceHasExtension = importSource.endsWith('.js')
                if (
                    skipUpdatingImportsWithoutExtension &&
                    !importSourceHasExtension
                ) {
                    return
                }

                // We'll need an extension to match with the renamed files Set
                const importSourceWithExtension = importSourceHasExtension
                    ? importSource
                    : importSource + '.js'
                // get the full path of the imported file from the cwd
                const importPathFromCwd = path.join(
                    filepath,
                    '..',
                    importSourceWithExtension
                )
                const isRenamed = renamedFiles.has(importPathFromCwd)

                // Since generating code from babel doesn't respect formatting,
                // update imports with just string replacement
                if (isRenamed) {
                    // updating & replacing the raw value, which includes quotes,
                    // ends up being more precise and avoids side effects
                    const rawImportSource = astPath.node.source.extra.raw
                    const newImportSource = importSourceWithExtension + 'x'
                    const newRawImportSource = rawImportSource.replace(
                        importSource,
                        newImportSource
                    )
                    reporter.debug(
                        `    Replacing ${importSource} => ${newImportSource}`
                    )
                    newCode = newCode.replace(
                        rawImportSource,
                        newRawImportSource
                    )
                    contentUpdated = true
                }
            },
        })

        if (contentUpdated) {
            await fs.writeFile(filepath, newCode)
            return true
        }
    } catch (err) {
        console.log(err)
        return false
    }
}

// todo: test filepaths
// const filepath = '../capture-app/src/core_modules/capture-core/rules/getApplicableRuleEffects.js'
// const filepath = '../capture-app/src/core_modules/capture-core/components/D2Form/D2Form.component.js'
// const filepath = 'examples/pwa-app/src/App.js'

// todo: hmm -- now that we're parsing ASTs, it may be best to use a map of
// { path: ast } ... or would that be too much memory?

const handler = async ({ skipUpdatingImportsWithoutExtension }) => {
    // 1. Search each JS file for JSX syntax
    // If found, 1) add to Set and 2) rename file (add 'x' to end)
    const globMatches = await fg.glob('src/**/*.js')
    // todo: progress bar: map index / globMatches.length
    reporter.info(`Searching for JSX in ${globMatches.length} files...`)
    const renamedFiles = new Set()
    await Promise.all(
        globMatches.map(async (matchPath) => {
            const jsxIsInFile = await isJsxInFile(matchPath)
            if (jsxIsInFile) {
                await renameFile(matchPath, renamedFiles)
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
    // todo: progress bar: map index / globMatches.length
    reporter.info(`Scanning ${globMatches2.length} files to update imports...`)
    let fileUpdatedCount = 0
    await Promise.all(
        globMatches2.map(async (matchPath) => {
            const importsAreUpdated = await updateImports({
                filepath: matchPath,
                renamedFiles,
                skipUpdatingImportsWithoutExtension,
            })
            if (importsAreUpdated) {
                fileUpdatedCount++
            }
        })
    )
    reporter.info(`Updated imports in ${fileUpdatedCount} file(s)`)

    // 3. Update d2.config.js
    // Read d2 config as JS for easier access to entryPoint strings
    const d2ConfigPath = path.join(process.cwd(), './d2.config.js')
    // todo: verify file exists before requiring
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
        skipUpdatingImportsWithoutExtension: {
            description:
                "Normally, this script will update `import './App'` to `import './App.jsx'`. Use this flag to skip adding the extension in this case. Imports that already end with .js will still be updated to .jsx",
            type: 'boolean',
            default: false,
        },
    },
    handler,
}

module.exports = command
