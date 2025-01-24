const fs = require('fs/promises')
const path = require('path')
const babel = require('@babel/core')
const { reporter /* chalk */ } = require('@dhis2/cli-helpers-engine')
const fg = require('fast-glob')

// These are the plugins needed to parse JS with various syntaxes --
// typescript shouldn't be needed
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

const jsRegex = /\.js(\.snap)?/ // handles .js or .js.snap files
const renameFile = async (filepath) => {
    const newPath = filepath.replace(jsRegex, '.jsx$1')
    reporter.debug(`Renaming ${filepath} to ${newPath}`)
    await fs.rename(filepath, newPath)
}

/**
 * For JS imports, this will handle imports either with or without a .js
 * extension, such that the result ends with .jsx if the target file has been
 * renamed
 * Files without extension are updated by default since some linting rules give
 * `import/no-unresolved` errors after switching to JSX if imports don't use
 * an extension
 * If `skipUpdatingImportsWithoutExtension` is set, imports without an extension
 * will be left as-is
 */
const resolveImportSource = ({
    filepath,
    importSource,
    renamedFiles,
    skipUpdatingImportsWithoutExtension,
}) => {
    // This doesn't handle files with an extension other than .js,
    // since they won't need updating
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

const isJestMock = (callee) =>
    callee.type === 'MemberExpression' &&
    callee.object?.name === 'jest' &&
    callee.property?.name === 'mock'

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

                const newImportSource = resolveImportSource({
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
            // Triggers on function calls -- we're looking for `jest.mock()`
            CallExpression: (astPath) => {
                const { callee } = astPath.node
                if (!isJestMock(callee)) {
                    return
                }

                const mockFileSource = astPath.node.arguments[0].value
                if (!mockFileSource.startsWith('.')) {
                    return // It's not a relative import; skip this one
                }

                const newMockFileSource = resolveImportSource({
                    filepath,
                    importSource: mockFileSource,
                    renamedFiles,
                    skipUpdatingImportsWithoutExtension,
                })

                // Since generating code from babel doesn't respect formatting,
                // update imports with just string replacement
                if (newMockFileSource !== mockFileSource) {
                    // updating & replacing the raw value, which includes quotes,
                    // ends up being more precise and avoids side effects
                    const rawImportSource = astPath.node.arguments[0].extra.raw
                    const newRawImportSource = rawImportSource.replace(
                        mockFileSource,
                        newMockFileSource
                    )
                    reporter.debug(
                        `    Replacing ${mockFileSource} => ${newMockFileSource}`
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
        }
        return contentUpdated
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
const defaultGlobString = 'src/**/*.js'
// in case a custom glob string includes node_modules somewhere:
const globOptions = { ignore: ['**/node_modules/**'] }

const handler = async ({
    globString = defaultGlobString,
    skipUpdatingImportsWithoutExtension,
}) => {
    validateGlobString(globString)

    // 1. Search each JS file for JSX syntax
    // If found, 2) Rename (add 'x' to the end) and 2) add path to a Set
    reporter.info(`Using glob ${globString}`)
    const globMatches = await fg.glob(globString, globOptions)
    reporter.info(`Searching for JSX in ${globMatches.length} files...`)
    const renamedFiles = new Set()
    await Promise.all(
        globMatches.map(async (matchPath) => {
            const jsxIsInFile = await isJsxInFile(matchPath)
            if (jsxIsInFile) {
                await renameFile(matchPath)
                renamedFiles.add(matchPath)
            }
        })
    )
    reporter.print(`Renamed ${renamedFiles.size} file(s)`)

    // 2. Go through each file again for imports
    // (Run glob again and include .jsx because some files have been renamed)
    // If there's a local file import, check to see if it matches
    // a renamed item in the set. If so, rewrite the new extension
    const globMatches2 = await fg.glob(globString + '(|x)', globOptions)
    reporter.info(`Scanning ${globMatches2.length} files to update imports...`)
    let filesUpdatedCount = 0
    await Promise.all(
        globMatches2.map(async (matchPath) => {
            const importsAreUpdated = await updateImports({
                filepath: matchPath,
                renamedFiles,
                skipUpdatingImportsWithoutExtension,
            })
            if (importsAreUpdated) {
                filesUpdatedCount++
            }
        })
    )
    reporter.print(`Updated imports in ${filesUpdatedCount} file(s)`)

    // 3. Update snapshot files
    const snapshotGlobString = globString + '.snap'
    const snapshotGlobMatches = await fg.glob(snapshotGlobString, globOptions)
    reporter.info(
        `Checking ${snapshotGlobMatches.length} snapshots to update filenames...`
    )
    let snapshotsUpdatedCount = 0
    await Promise.all(
        snapshotGlobMatches.map(async (matchPath) => {
            // Default snapshot location is './__snapshots__/<baseTestFilename>.snap'
            const baseTestFilename = matchPath
                .replace(/\.snap$/, '')
                .replace('__snapshots__/', '')
            const baseTestFileIsUpdated = renamedFiles.has(baseTestFilename)
            if (baseTestFileIsUpdated) {
                await renameFile(matchPath)
                snapshotsUpdatedCount++
            }
        })
    )
    reporter.print(`Updated ${snapshotsUpdatedCount} snapshot filename(s)`)

    // 4. Update d2.config.js
    const d2ConfigPath = path.join(process.cwd(), 'd2.config.js')
    reporter.info('Checking d2.config.js for entry points to update...')
    reporter.debug(`d2 config path: ${d2ConfigPath}`)

    // Read d2 config as JS for easy access to entryPoint strings
    let entryPoints
    try {
        const d2Config = require(d2ConfigPath)
        entryPoints = d2Config.entryPoints
    } catch (err) {
        reporter.warn(`Did not find d2.config.js at ${d2ConfigPath}; finishing`)
        return
    }

    const d2ConfigContents = await fs.readFile(d2ConfigPath, {
        encoding: 'utf8',
    })
    let newD2ConfigContents = d2ConfigContents
    let configContentUpdated = false
    Object.values(entryPoints).forEach((entryPoint) => {
        const newEntryPointSource = resolveImportSource({
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
        reporter.print('Updated d2.config.js entry points')
    } else {
        reporter.print('No entry points updated')
    }
}

const command = {
    command: 'js-to-jsx',
    desc: 'Renames .js files that include JSX to .jsx. Also handles file imports and d2.config.js',
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
