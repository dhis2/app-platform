const extensionPattern = /\.([jt])sx?$/
const normalizeExtension = (path) => {
    const match = path.match(extensionPattern)
    if (match[1] === 't') {
        // This is a .ts or .tsx file - convert to .js,
        // since imports should omit extensions in TS files
        return path.replace(extensionPattern, '.js')
    }

    // For .js or .jsx files, leave as-is
    // (though actual JSX will still get transpiled by babel)
    return path
}

module.exports.extensionPattern = extensionPattern
module.exports.normalizeExtension = normalizeExtension
