const makeBabelConfig = require('./makeBabelConfig.js')
module.exports = require('babel-jest').default.createTransformer(
    makeBabelConfig({ mode: 'test' })
)
