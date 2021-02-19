const { reporter, chalk } = require('@dhis2/cli-helpers-engine')
const { writeJSON } = require('fs-extra')
const inquirer = require('inquirer')

/*
 * Check for incorrect app dependencies
 */

const singletonDependencies = [
    'react',
    'react-dom',
    '@dhis2/app-runtime',
    '@dhis2/d2-i18n',
    'styled-jsx',
    '@dhis2/ui',
    '@dhis2/ui-core',
]

const sortByKey = obj => {
    const orderedObj = {}
    Object.keys(obj)
        .sort()
        .forEach(key => {
            orderedObj[key] = obj[key]
        })
    return orderedObj
}

const fixDeps = async (pkg, packageFile, extraneousDeps) => {
    reporter.print(
        'Moving dependencies to peerDependencies and devDependencies...'
    )

    const depsToMove = extraneousDeps.reduce((acc, dep) => {
        acc[dep] = pkg.dependencies[dep]
        return acc
    }, {})

    const newPkg = {
        ...pkg,
    }

    newPkg.dependencies = Object.entries(pkg.dependencies).reduce(
        (acc, [dep, resolution]) => {
            if (!extraneousDeps.includes(dep)) {
                acc[dep] = resolution
            }
            return acc
        },
        {}
    )
    newPkg.peerDependencies = sortByKey({
        ...depsToMove,
        ...pkg.peerDependencies,
    })
    newPkg.devDependencies = sortByKey({
        ...depsToMove,
        ...pkg.devDependencies,
    })

    await writeJSON(packageFile, newPkg, { spaces: 4 })
}

module.exports.validateSingletonDependencies = async (
    pkg,
    { paths, offerFix }
) => {
    if (pkg.dependencies) {
        const extraneousDeps = singletonDependencies.filter(
            dep => !!pkg.dependencies[dep]
        )
        if (extraneousDeps.length) {
            reporter.warn(
                `The following must not be specified as ${chalk.bold(
                    'dependencies'
                )}\n${extraneousDeps.map(
                    dep => `\t- ${dep}\n`
                )}Please move them to ${chalk.bold(
                    'peerDependencies'
                )} (and optionally ${chalk.bold('devDependencies')})`
            )

            if (offerFix) {
                const { fix } = await inquirer.prompt({
                    name: 'fix',
                    type: 'confirm',
                    message: 'Would you like to move these dependencies?',
                })

                if (!fix) {
                    return false
                }

                await fixDeps(pkg, paths.package, extraneousDeps)
            } else {
                return false
            }
        }
    }
}
