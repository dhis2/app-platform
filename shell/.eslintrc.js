const fs = require('fs')
const path = require('path')

const eslintRunningLocally = process.cwd() === __dirname

const delegateEslintConfig = path.resolve(__dirname, '../.eslintrc.js') // This should only exist when in development!
const shouldDelegate =
    !eslintRunningLocally && fs.existsSync(delegateEslintConfig)

const extendsList = shouldDelegate
    ? [delegateEslintConfig, 'react-app']
    : 'react-app'
module.exports = {
    ignorePatterns: shouldDelegate ? [] : ['src/D2App/*'],
    extends: extendsList,
}
