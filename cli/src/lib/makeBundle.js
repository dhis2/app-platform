const path = require('path')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const archiver = require('archiver')
const fs = require('fs-extra')

module.exports = (inDir, outFile) => {
    return new Promise((resolve, reject) => {
        fs.ensureDirSync(path.dirname(outFile))
        const output = fs.createWriteStream(outFile)

        const archive = archiver('zip', {
            zlib: { level: 9 },
        })

        output.on('close', function () {
            reporter.print(chalk.dim(`Total size: ${archive.pointer()} bytes`))
            resolve()
        })

        archive.on('warning', function (err) {
            if (err.code === 'ENOENT') {
                reporter.warn('[bundler]', err)
            } else {
                reject(err)
            }
        })

        archive.on('error', function (err) {
            reject(err)
        })

        archive.pipe(output)

        // avoid packing the created file stream
        const files = fs
            .readdirSync(inDir)
            .filter(
                f => path.resolve(inDir, f) !== path.resolve(inDir, outFile)
            )

        reporter.debug('Pack list', files)

        for (const file of files) {
            const fp = path.resolve(inDir, file)
            const stat = fs.statSync(fp)

            if (stat.isDirectory()) {
                archive.directory(fp, path.basename(fp))
            }

            if (stat.isFile()) {
                archive.file(fp, {
                    name: path.basename(fp),
                })
            }
        }

        archive.finalize()
    })
}
