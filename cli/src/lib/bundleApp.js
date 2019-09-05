const fs = require('fs-extra')
const chalk = require('chalk')
const path = require('path')
const archiver = require('archiver')
const { reporter } = require('@dhis2/cli-helpers-engine')

module.exports = (inDir, outFile) => {
    return new Promise((resolve, reject) => {
        // create a file to stream archive data to.
        fs.ensureDirSync(path.dirname(outFile))
        const output = fs.createWriteStream(outFile)

        const archive = archiver('zip', {
            zlib: { level: 9 }, // Sets the compression level.
        })

        // listen for all archive data to be written
        // 'close' event is fired only when a file descriptor is involved
        output.on('close', function() {
            reporter.print(chalk.dim(`Total size: ${archive.pointer()} bytes`))
            resolve()
        })

        // good practice to catch warnings (ie stat failures and other non-blocking errors)
        archive.on('warning', function(err) {
            if (err.code === 'ENOENT') {
                reporter.warn('[bundler]', err)
            } else {
                reject(err)
            }
        })

        // good practice to catch this error explicitly
        archive.on('error', function(err) {
            reject(err)
        })

        // pipe archive data to the file
        archive.pipe(output)
        archive.directory(inDir, false)
        archive.finalize()
    })
}
