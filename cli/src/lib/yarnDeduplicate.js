// From https://github.com/atlassian/yarn-deduplicate
// Copyright (c) 2017 Atlassian and others

// Modifications:
//   - `listDuplicates` returns package information as an object rather than a string
//   - `getDuplicatedPackages` includes counts different major versions as duplicates if `singleton` arg is true

const lockfile = require('@yarnpkg/lockfile')
const semver = require('semver')

const parseYarnLock = file => lockfile.parse(file).object

const extractPackages = ({
    json,
    includeScopes = [],
    includePackages = [],
    excludePackages = [],
}) => {
    const packages = {}
    const re = /^(.*)@([^@]*?)$/

    Object.keys(json).forEach(name => {
        const pkg = json[name]
        const match = name.match(re)

        let packageName, requestedVersion
        // TODO: make this ignore other urls like:
        //      git...
        //      user/repo
        //      tag
        //      path/path/path
        if (match) {
            ;[, packageName, requestedVersion] = match
        } else {
            // If there is no match, it means there is no version specified. According to the doc
            // this means "*" (https://docs.npmjs.com/files/package.json#dependencies)
            packageName = name
            requestedVersion = '*'
        }

        // If there is a list of scopes, only process those.
        if (
            includeScopes.length > 0 &&
            !includeScopes.find(scope => packageName.startsWith(`${scope}/`))
        ) {
            return
        }

        // If there is a list of package names, only process those.
        if (
            includePackages.length > 0 &&
            !includePackages.includes(packageName)
        ) {
            return
        }

        if (
            excludePackages.length > 0 &&
            excludePackages.includes(packageName)
        ) {
            return
        }

        packages[packageName] = packages[packageName] || []
        packages[packageName].push({
            pkg,
            name: packageName,
            requestedVersion,
            installedVersion: pkg.version,
            satisfiedBy: new Set(),
        })
    })
    return packages
}

const computePackageInstances = ({
    packages,
    name,
    useMostCommon,
    includePrerelease = false,
    singleton = false,
}) => {
    // Instances of this package in the tree
    const packageInstances = packages[name]

    // Extract the list of unique versions for this package
    const versions = packageInstances.reduce((versions, packageInstance) => {
        if (packageInstance.installedVersion in versions) {
            return versions
        }
        versions[packageInstance.installedVersion] = {
            pkg: packageInstance.pkg,
            satisfies: new Set(),
        }
        return versions
    }, {})

    // Link each package instance with all the versions it could satisfy.
    Object.keys(versions).forEach(version => {
        const satisfies = versions[version].satisfies
        packageInstances.forEach(packageInstance => {
            // We can assume that the installed version always satisfied the requested version.
            packageInstance.satisfiedBy.add(packageInstance.installedVersion)
            // In some cases the requested version is invalid form a semver point of view (for
            // example `sinon@next`). Just ignore those cases, they won't get deduped.
            if (
                singleton ||
                (semver.validRange(packageInstance.requestedVersion, {
                    includePrerelease,
                }) &&
                    semver.satisfies(
                        version,
                        packageInstance.requestedVersion,
                        {
                            includePrerelease,
                        }
                    ))
            ) {
                satisfies.add(packageInstance)
                packageInstance.satisfiedBy.add(version)
            }
        })
    })

    // Sort the list of satisfied versions
    packageInstances.forEach(packageInstance => {
        // Save all versions for future reference
        packageInstance.versions = versions

        // Compute the versions that actually satisfy this instance
        const candidateVersions = Array.from(packageInstance.satisfiedBy)
        candidateVersions.sort((versionA, versionB) => {
            if (useMostCommon) {
                // Sort verions based on how many packages it satisfies. In case of a tie, put the
                // highest version first.
                if (
                    versions[versionB].satisfies.size >
                    versions[versionA].satisfies.size
                ) {
                    return 1
                }
                if (
                    versions[versionB].satisfies.size <
                    versions[versionA].satisfies.size
                ) {
                    return -1
                }
            }
            return semver.rcompare(versionA, versionB, { includePrerelease })
        })
        packageInstance.satisfiedBy = candidateVersions

        // The best package is always the first one in the list thanks to the sorting above.
        packageInstance.bestVersion = candidateVersions[0]
    })

    return packageInstances
}

const getDuplicatedPackages = (
    json,
    {
        includeScopes,
        includePackages,
        excludePackages,
        useMostCommon,
        includePrerelease = false,
        singleton = false,
    }
) => {
    const packages = extractPackages({
        json,
        includeScopes,
        includePackages,
        excludePackages,
    })

    return Object.keys(packages)
        .reduce(
            (acc, name) =>
                acc.concat(
                    computePackageInstances({
                        packages,
                        name,
                        useMostCommon,
                        includePrerelease,
                        singleton,
                    })
                ),
            []
        )
        .filter(
            ({ bestVersion, installedVersion }) =>
                bestVersion !== installedVersion
        )
}

module.exports.listDuplicates = (
    yarnLock,
    {
        includeScopes = [],
        includePackages = [],
        excludePackages = [],
        useMostCommon = false,
        includePrerelease = false,
        singleton = false,
    } = {}
) => {
    const json = parseYarnLock(yarnLock)

    return getDuplicatedPackages(json, {
        includeScopes,
        includePackages,
        excludePackages,
        useMostCommon,
        includePrerelease,
        singleton,
    }).reduce((duplicates, { name, versions }) => {
        if (!duplicates.has(name)) {
            duplicates.set(name, Object.keys(versions))
        }
        return duplicates
    }, new Map())
}

module.exports.fixDuplicates = (
    yarnLock,
    {
        includeScopes = [],
        includePackages = [],
        excludePackages = [],
        useMostCommon = false,
        includePrerelease = false,
    } = {}
) => {
    const json = parseYarnLock(yarnLock)

    getDuplicatedPackages(json, {
        includeScopes,
        includePackages,
        excludePackages,
        useMostCommon,
        includePrerelease,
    }).forEach(({ bestVersion, name, versions, requestedVersion }) => {
        json[`${name}@${requestedVersion}`] = versions[bestVersion].pkg
    })

    return lockfile.stringify(json)
}
