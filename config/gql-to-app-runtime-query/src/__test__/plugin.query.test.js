const fs = require('fs')
const path = require('path')
const babel = require('@babel/core')
const { plugin } = require('../plugin')

const createTestFilePath = fileName => path.join(__dirname, 'plugin', fileName)
const readTestFile = _fileName => {
    const fileName = path.join(..._fileName.split('/'))
    const filePath = createTestFilePath(fileName)
    return fs.readFileSync(filePath, { encoding: 'utf8' })
}
const transform = code => {
    const result = babel.transformSync(code, {
        plugins: [plugin],
    })

    // Vim automatically appends empty lines.
    // So the file with the expected code has an empty line.
    // Needs to taken into account with the generated code
    return `${result.code}\n`
}

describe('plugin', () => {
    describe('Success', () => {
        it.only('should provide the default values of the variables in the params function', () => {
            const inputCode = readTestFile('success-queries/default-values.js')
            transform(inputCode)
            // console.log(transform(inputCode))
            // const outputCode = readTestFile('success-queries/default-values.transformed.js')
            // expect(transform(inputCode)).toBe(outputCode)
        })

        it('should provide handle nested fields correctly', () => {
            const inputCode = readTestFile('success-queries/nested-fields.js')
            const outputCode = readTestFile('success-queries/nested-fields.transformed.js')
            expect(transform(inputCode)).toBe(outputCode)
        })

        it('should handle nested resource params correctly', () => {
            const inputCode = readTestFile('success-queries/complex-resource-params.js')
            console.log('transform(inputCode)', transform(inputCode))
            // const outputCode = readTestFile('success-queries/complex-resource-params.transformed.js')
            // expect(transform(inputCode)).toBe(outputCode)
        })

        it.skip('should replace the graphql query with an app-runtime query', () => {
            const inputCode = readTestFile('querySuccessfulGraphql.js')
            const outputCode = readTestFile('querySuccessfulRuntime.js')
            expect(transform(inputCode)).toBe(outputCode)
        })
    })
})
