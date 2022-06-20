const fs = require('fs')
const path = require('path')

// This should only exist when in development!
const rootConfigPath = path.resolve(__dirname, '../.eslintrc.js')

const isRunningHere = process.cwd() === __dirname
const hasRootConfig = fs.existsSync(rootConfigPath)
const isDevelopment = !isRunningHere && hasRootConfig

// Use local config for developing this library, react-app preset for linting app code
const extendsList = isDevelopment ? rootConfigPath : 'react-app'
// Ignore app code that the dev has no control over
const ignorePatterns = isDevelopment ? [] : ['src/D2App/*']

module.exports = {
    ignorePatterns,
    extends: extendsList,
}
