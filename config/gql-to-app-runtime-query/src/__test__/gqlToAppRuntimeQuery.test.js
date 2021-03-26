const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const { gqlToAppRuntimeQuery } = require('../gqlToAppRuntimeQuery')

const createTestFilePath = fileName =>
    path.join(__dirname, 'gqlToAppRuntimeQuery', fileName)

const graphqlQueryPath = createTestFilePath('graphqlQuery.js')
const runtimeQueryPath = createTestFilePath('runtimeQuery.js')

const graphqlQuery = fs.readFileSync(graphqlQueryPath, { encoding: 'utf8' })
const runtimeQuery = fs.readFileSync(runtimeQueryPath, { encoding: 'utf8' })

describe('gqlToAppRuntimeQuery', () => {
    const transform = code =>
        babel.transformSync(code, {
            plugins: [gqlToAppRuntimeQuery],
        })

    describe('query', () => {
        it('should replace the graphql query with an app-runtime query', () => {
            // Vim automatically appends empty lines.
            // So the file with the expected code has an empty line.
            // Needs to taken into account with the generated code
            const actual = `${transform(graphqlQuery).code}\n`
            const expected = runtimeQuery
            expect(actual).toBe(expected)
        })
    })

    describe('mutation', () => {
        it('should replace the graphql mutation with an app-runtime mutation', () => {
            // Vim automatically appends empty lines.
            // So the file with the expected code has an empty line.
            // Needs to taken into account with the generated code
            const actual = `${transform(graphqlQuery).code}\n`
            const expected = runtimeQuery
            expect(actual).toBe(expected)
        })
    })
})
