const fs = require('fs/promises')
const path = require('path')
const fg = require('fast-glob')

// Looks for JSX syntax; avoids comments
// Known false positives: in strings or multiline comments (see regex101)
// https://regex101.com/r/YDkml7/5
const jsxRegex = /^(?![ \t]*(?:\/\/|\/?\*+)).*(<\/?[a-zA-Z]+[^>]*>)/gim

// Looks for relative import statements
// https://regex101.com/r/xsHZdQ/2
const importRegex = /(import.*|from) ['"](\..*)['"]/gim

;(async function () {
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
                // todo: logging
                // console.log(`Renaming ${matchPath} to ${newPath}`)

                await fs.rename(matchPath, newPath)
                renamedFiles.add(matchPath)
            }
        })
    )
    // todo: logging
    console.log(`${renamedFiles.size} files renamed`)

    // 2. Go through each file again for imports
    // (Run glob again because some files have been renamed)
    // If there's a local file import, check to see if it matches
    // a renamed item in the set. If so, rewrite the new extension
    // (Note: Files without extension aren't edited; Vite and TS
    // handle them, so it's up to eslint rules)
    const globMatches2 = await fg.glob('src/**/*.(js|jsx)')
    await Promise.all(
        globMatches2.map(async (matchPath) => {
            const fileContent = await fs.readFile(matchPath, {
                encoding: 'utf8',
            })

            let newFileContent = fileContent
            const importMatches = Array.from(fileContent.matchAll(importRegex))
            importMatches.forEach((match) => {
                // get the second capturing group, the import path
                const importPath = match[2]
                const joinedPath = path.join(matchPath, '..', importPath)
                const isRenamed = renamedFiles.has(joinedPath)

                if (isRenamed) {
                    newFileContent = newFileContent.replace(
                        importPath,
                        importPath + 'x'
                    )
                }
            })
            await fs.writeFile(matchPath, newFileContent)
        })
    )
    // todo: logging

    // 3. Update d2.config.js
    // Read d2 config as JS for easier access to entryPoint strings
    const { entryPoints } = require('./d2.config.js')
    const d2ConfigContents = await fs.readFile('./d2.config.js', {
        encoding: 'utf8',
    })
    let newD2ConfigContents = d2ConfigContents
    Object.values(entryPoints).forEach((entryPoint) => {
        // entryPoint is formatted as './src/...' -- drop first 2 chars
        // to match the glob format above
        if (renamedFiles.has(entryPoint.substring(2))) {
            newD2ConfigContents = newD2ConfigContents.replace(
                entryPoint,
                entryPoint + 'x'
            )
        }
    })
    await fs.writeFile('./d2.config.js', newD2ConfigContents)
    // todo: logging
})()
