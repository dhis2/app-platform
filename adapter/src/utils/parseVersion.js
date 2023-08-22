export const parseVersion = (versionString) => {
    const [mainVersion, tag] = versionString?.split('-') || []
    const [major, minor, patch] = mainVersion?.split('.') || []

    const parsedVersion = {
        full: versionString,
        major: parseInt(major) || undefined, // 2
        minor: parseInt(minor) || undefined, // 34
        patch: parseInt(patch) || undefined, // 1
        tag, // SNAPSHOT || undefined
    }

    return parsedVersion
}

export const parseDHIS2ServerVersion = (versionString) => {
    const parsedVersion = parseVersion(versionString)

    if (
        !parsedVersion.major ||
        !parsedVersion.minor ||
        parsedVersion.major !== 2
    ) {
        console.warn(
            'Improperly formatted DHIS2 systemInfo server version',
            versionString
        )
    }

    return parsedVersion
}
