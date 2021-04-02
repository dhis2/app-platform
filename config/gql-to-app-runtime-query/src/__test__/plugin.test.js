const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const { plugin } = require('../plugin')

const createTestFilePath = fileName => path.join(__dirname, 'plugin', fileName)

describe('plugin', () => {
    const transform = code =>
        babel.transformSync(code, {
            plugins: [plugin],
        })

    describe.only('query', () => {
        const graphqlQueryPath = createTestFilePath('graphqlQuery.js')
        const runtimeQueryPath = createTestFilePath('runtimeQuery.js')
        const graphqlQuery = fs.readFileSync(graphqlQueryPath, {
            encoding: 'utf8',
        })
        const runtimeQuery = fs.readFileSync(runtimeQueryPath, {
            encoding: 'utf8',
        })

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
        const graphqlMutationPath = createTestFilePath('graphqlMutation.js')
        const runtimeMutationPath = createTestFilePath('runtimeMutation.js')
        const graphqlMutation = fs.readFileSync(graphqlMutationPath, {
            encoding: 'utf8',
        })
        const runtimeMutation = fs.readFileSync(runtimeMutationPath, {
            encoding: 'utf8',
        })

        it('should replace the graphql mutation with an app-runtime mutation', () => {
            // Vim automatically appends empty lines.
            // So the file with the expected code has an empty line.
            // Needs to taken into account with the generated code
            const actual = `${transform(graphqlMutation).code}\n`
            const expected = runtimeMutation
            expect(actual).toBe(expected)
        })
    })
})
