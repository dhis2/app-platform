const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const fs = require('fs-extra')
const path = require('path')

const supportedExtensions = ['.js', '.jsx', '.ts', '.tsx']

module.exports.ensureDirectoryExists = dir => {
    const dirPath = path.normalize(dir)
    try {
        const stat = fs.lstatSync(dirPath)

        if (!stat.isDirectory()) {
            reporter.error(
                `Directory ${chalk.bold(dirPath)} is not a directory.`
            )
            process.exit(1)
        }
    } catch (e) {
        reporter.error(`Directory ${chalk.bold(dirPath)} does not exist.`)
        process.exit(1)
    }
}

// src from component/array-equal
module.exports.arrayEqual = (arr1, arr2) =>
    arr1.length === arr2.length && arr1.some((item, idx) => item === arr2[idx])

function walkDirectory(dirPath, files = []) {
    const list = fs.readdirSync(dirPath)

    list.forEach(fileName => {
        const filePath = path.join(dirPath, fileName)
        const stat = fs.lstatSync(filePath)

        if (stat.isDirectory()) {
            walkDirectory(filePath, files)
        } else if (stat.isFile() && !stat.isSymbolicLink()) {
            const ext = path.extname(fileName)

            if (supportedExtensions.includes(ext)) {
                files.push(filePath)
            }
        }
    })

    return files
}

module.exports.walkDirectory = walkDirectory
