const fs = require('fs')
const { reporter, prompt, exec } = require('@dhis2/cli-helpers-engine')
const { listDuplicates, fixDuplicates } = require('../yarnDeduplicate')

const singletonDependencies = [
    '@dhis2/app-runtime',
    '@dhis2/d2-i18n',
    '@dhis2/ui',
    'react',
    'styled-jsx',
]

const listSingletonDuplicates = yarnLock =>
    listDuplicates(yarnLock, {
        includePackages: singletonDependencies,
        singleton: true,
    })

exports.validateLockfile = async (pkg, { paths, offerFix = false }) => {
    if (paths.yarnLock === null) {
        reporter.warn('Could not find yarn.lock')
        return false
    }

    const yarnLock = fs.readFileSync(paths.yarnLock, 'utf8')

    // Yarn v2 and above deduplicate dependencies automatically
    if (!yarnLock.includes('# yarn lockfile v1')) {
        return true
    }

    const singletonDuplicates = listSingletonDuplicates(yarnLock)
    for (const [name, versions] of singletonDuplicates) {
        reporter.warn(
            `Found ${
                versions.length
            } versions of '${name}' in yarn.lock: ${versions.join(', ')}`
        )
    }

    const valid = singletonDuplicates.size === 0
    if (!valid && offerFix) {
        const { fix } = await prompt({
            name: 'fix',
            type: 'confirm',
            message:
                'There are duplicate dependencies in yarn.lock, would you like to correct them now?',
        })

        if (!fix) {
            return false
        }
        const dedupedYarnLock = fixDuplicates(yarnLock)
        fs.writeFileSync(paths.yarnLock, dedupedYarnLock)
        await exec({
            cmd: 'yarn',
            args: ['install'],
            cwd: paths.base,
        })
        return listSingletonDuplicates(dedupedYarnLock).size === 0
    }

    return valid
}
