const makeBabelConfig = require('./makeBabelConfig.js')
module.exports = require('babel-jest').createTransformer(
    makeBabelConfig({ mode: 'test' })
)
