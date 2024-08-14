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

/**
 * For JS imports, this will handle imports either with or without a .js
 * extension, such that the result ends with .jsx if the target file has been
 * renamed.
 * Files without extension are updated by default since some linting rules give
 * `import/no-unresolved` errors after switching to JSX if imports don't use
 * an extension
 *
 * If `skipUpdatingImportsWithoutExtension` is set, imports without an extension
 * will be left as-is
 */
const updateImportSource = ({
    filepath,
    importSource,
    renamedFiles,
    skipUpdatingImportsWithoutExtension,
}) => {
    // This is a little weird for files with an extension other
    // than .js, but it's okay since they won't need updating
    const importSourceHasExtension = importSource.endsWith('.js')
    if (skipUpdatingImportsWithoutExtension && !importSourceHasExtension) {
        return importSource
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
    return isRenamed ? importSourceWithExtension + 'x' : importSource
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
            // Triggers on imports and exports, the latter for cases like
            // `export * from './file.js'`
            'ImportDeclaration|ExportDeclaration': (astPath) => {
                if (!astPath.node.source) {
                    return // for exports from this file itself
                }

                const importSource = astPath.node.source.value
                if (!importSource.startsWith('.')) {
                    return // not a relative import
                }

                const newImportSource = updateImportSource({
                    filepath,
                    importSource,
                    renamedFiles,
                    skipUpdatingImportsWithoutExtension,
                })

                // Since generating code from babel doesn't respect formatting,
                // update imports with just string replacement
                if (newImportSource !== importSource) {
                    // updating & replacing the raw value, which includes quotes,
                    // ends up being more precise and avoids side effects
                    const rawImportSource = astPath.node.source.extra.raw
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

const validateGlobString = (glob) => {
    if (!glob.endsWith('.js')) {
        throw new Error('Glob string must end with .js')
    }
}
// in case of custom glob string
const globOptions = { ignore: ['**/node_modules/**'] }

const defaultGlobString = 'src/**/*.js'
const handler = async ({
    globString = defaultGlobString,
    skipUpdatingImportsWithoutExtension,
}) => {
    validateGlobString(globString)

    // 1. Search each JS file for JSX syntax
    // If found, 1) add to Set and 2) rename file (add 'x' to end)
    reporter.info(`Using glob ${globString}`)
    const globMatches = await fg.glob(globString, globOptions)
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
    const globMatches2 = await fg.glob(globString + '(|x)', globOptions)
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
    const d2ConfigPath = path.join(process.cwd(), 'd2.config.js')
    reporter.info('Checking d2.config.js for entry points to update...')
    reporter.debug(`d2 config path: ${d2ConfigPath}`)

    // Read d2 config as JS for easy access to entryPoint strings
    let entryPoints
    try {
        const d2Config = require(d2ConfigPath)
        entryPoints = d2Config.entryPoints
    } catch (err) {
        reporter.info(`Did not find d2.config.js at ${d2ConfigPath}; finishing`)
        return
    }

    const d2ConfigContents = await fs.readFile(d2ConfigPath, {
        encoding: 'utf8',
    })
    let newD2ConfigContents = d2ConfigContents
    let configContentUpdated = false
    Object.values(entryPoints).forEach((entryPoint) => {
        const newEntryPointSource = updateImportSource({
            filepath: 'd2.config.js',
            importSource: entryPoint,
            renamedFiles,
            skipUpdatingImportsWithoutExtension,
        })
        if (newEntryPointSource !== entryPoint) {
            newD2ConfigContents = newD2ConfigContents.replace(
                entryPoint,
                newEntryPointSource
            )
            configContentUpdated = true
            reporter.debug(
                `Updating entry point ${entryPoint} => ${newEntryPointSource}`
            )
        }
    })

    if (configContentUpdated) {
        await fs.writeFile(d2ConfigPath, newD2ConfigContents)
        reporter.info('Updated d2.config.js entry points')
    } else {
        reporter.info('No entry points updated')
    }
}

const command = {
    command: 'jsx-migration',
    desc: 'Renames .js files to .jsx -- also handles file imports and d2.config.js',
    builder: {
        skipUpdatingImportsWithoutExtension: {
            description:
                "Normally, this script will update `import './App'` to `import './App.jsx'`. Use this flag to skip adding the extension in this case. Imports that already end with .js will still be updated to .jsx",
            type: 'boolean',
            default: false,
        },
        globString: {
            description:
                'Glob string to use for finding files to parse, rename, and update imports. It will be manipulated by the script, so it must end with .js, and make sure to use quotes around this argument to keep it a string',
            type: 'string',
            default: defaultGlobString,
        },
    },
    handler,
}

module.exports = command
