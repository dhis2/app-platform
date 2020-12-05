/*
 *  This utility node script is used to copy the current shell into this package for bundled publication
 */

const fs = require('fs-extra')
const path = require('path')
const archiver = require('archiver')
const { reporter, chalk } = require('@dhis2/cli-helpers-engine')

const bundleShell = (shellDir, shellAssetPath) => {
    fs.removeSync(shellAssetPath)

    fs.copySync(shellDir, shellAssetPath, {
        filter: src => {
            const filtered = !src.match(`^${shellDir}/(node_modules|build)($|/.*)`)
            console.log(src, filtered)
            return filtered
        }
    })
}

const shellDir = process.argv[2]
const shellAssetPath = process.argv[3]

if (!shellDir || !shellAssetPath) {
    reporter.error(`Usage: yarn node ${process.argv[1]} <shellDir> <shellAssetPath>`)
    process.exit(1)
}

if (!fs.existsSync(shellDir) || !fs.statSync(shellDir).isDirectory()) {
    reporter.error(`Path ${shellDir} does not exist or is not a directory`)
    process.exit(2)
}

reporter.info('Bundling shell asset...')

bundleShell(shellDir, shellAssetPath)

reporter.info('Done!')
process.exit(0)