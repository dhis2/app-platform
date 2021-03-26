const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const { gqlToAppRuntimeQuery } = require('../gqlToAppRuntimeQuery')

const codePath = path.join(__dirname, 'code.js')
const code = fs.readFileSync(codePath, { encoding: 'utf8' })
const runtimeQueryPath = path.join(__dirname, 'runtimeQuery.js')
const runtimeQuery = fs.readFileSync(runtimeQueryPath, { encoding: 'utf8' })

describe('gqlToAppRuntimeQuery', () => {
    const transform = code =>
        babel.transformSync(code, {
            plugins: [gqlToAppRuntimeQuery],
        })

    it('should replace the graphql query with an app-runtime query', () => {
        // Vim automatically appends empty lines.
        // So the file with the expected code has an empty line.
        // Needs to taken into account with the generated code
        const actual = `${transform(code).code}\n`
        const expected = runtimeQuery
        expect(actual).toBe(expected)
    })
})
