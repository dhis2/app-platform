const extensionPattern = /\.[jt]sx?$/
const normalizeExtension = ext => ext.replace(extensionPattern, '.js')

module.exports.extensionPattern = extensionPattern
module.exports.normalizeExtension = normalizeExtension