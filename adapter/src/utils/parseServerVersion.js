export const parseServerVersion = versionString => {
    const [mainVersion, tag] = versionString.split('-')
    const [major, minor, patch] = mainVersion.split('.')

    const parsedVersion = {
        major: parseInt(major) || 2, // 2
        minor: parseInt(minor) || undefined, // 34
        patch: parseInt(patch) || undefined, // 0
        tag, // SNAPSHOT || undefined
    }

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
