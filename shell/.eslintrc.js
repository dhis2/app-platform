const fs = require('fs'),
    path = require('path')

const customConfigFile = path.resolve('../../.eslintrc.js')
const hasCustomConfig = fs.existsSync(customConfigFile)

const extendsArray = hasCustomConfig
    ? [require(customConfigFile)]
    : ['react-app']

module.exports = {
    extends: extendsArray,
}
