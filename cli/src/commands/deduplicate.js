const fs = require('fs')
const { reporter, chalk, exit } = require('@dhis2/cli-helpers-engine')
const makePaths = require('../lib/paths')
const { listDuplicates, fixDuplicates } = require('../lib/yarnDeduplicate')

const handler = async ({ cwd }) => {
    const paths = makePaths(cwd)

    if (paths.pnpmLock !== null) {
        return true;
    }

    if (paths.yarnLock === null) {
        exit(1, 'Could not find yarn.lock')
    }

    const yarnLock = fs.readFileSync(paths.yarnLock, 'utf8')
    const deduped = fixDuplicates(yarnLock)
    fs.writeFileSync(paths.yarnLock, deduped)

    if (deduped !== yarnLock) {
        reporter.info(
            `Run ${chalk.bold('yarn install')} to deduplicate node_modules`
        )
    }

    const duplicates = listDuplicates(deduped)
    if (duplicates.size > 0) {
        reporter.error('Failed to deduplicate the following packages:')
        for (const [name, versions] of duplicates) {
            reporter.error(
                ` * ${chalk.bold(name)} (found versions ${versions.join(', ')})`
            )
        }
        exit(1)
    }
}

const command = {
    command: 'deduplicate',
    desc: 'Deduplicate dependencies found in yarn.lock',
    handler,
}

module.exports = command
