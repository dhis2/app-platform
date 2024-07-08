const { reporter } = require('@dhis2/cli-helpers-engine')
const { parseAdditionalNamespaces } = require('./parseAdditionalNamespaces')

jest.mock('@dhis2/cli-helpers-engine', () => ({
    reporter: { warn: jest.fn() },
    chalk: { bold: jest.fn().mockImplementation((input) => input) },
}))

test('undefined', () => {
    const output = parseAdditionalNamespaces(undefined)
    expect(output).toBe(undefined)
    expect(reporter.warn).toHaveBeenCalledTimes(0)
})

test('the happy path', () => {
    const additionalNamespaces = [
        { namespace: 'extra1', authorities: ['M_extra1'] },
        { namespace: 'extra2', readAuthorities: ['M_extra2read'] },
        { namespace: 'extra3', writeAuthorities: ['M_extra3write'] },
        {
            namespace: 'extra4',
            authorities: ['M_extra4readwrite'],
            writeAuthotities: ['M_extra4write'],
        },
    ]

    const output = parseAdditionalNamespaces(additionalNamespaces)
    expect(output).toEqual(additionalNamespaces)
    expect(reporter.warn).toHaveBeenCalledTimes(0)
})

describe('handling faults', () => {
    test('additionalNamespaces is not an array', () => {
        const additionalNamespaces = {
            namespace: 'extra1',
            authorities: ['M_extra1'],
        }

        const output = parseAdditionalNamespaces(additionalNamespaces)

        expect(output).toBe(undefined)
        expect(reporter.warn).toHaveBeenCalledTimes(1)
    })

    test('invalid namespace options get filtered out', () => {
        const testNamespaces = [
            { namespace: 'no-authorities' },
            { authorities: ['F_MISSING-NAMESPACE-STRING'] },
            {
                namespace: 'valid-namespace-1',
                readAuthorities: ['M_extra-read'],
                writeAuthorities: ['M_extra-write'],
            },
            { namespace: ['not-a-string'], readAuthorities: ['M_extra2read'] },
            {
                namespace: 'invalid-value-type',
                readAuthorities: 'should-be-an-array',
            },
            {
                namespace: 'one-correct-auths-prop-one-error',
                readAuthorities: ['M_extra-read'],
                writeAuthorities: 'should-be-an-array',
            },
            {
                namespace: 'valid-namespace-2',
                writeAuthorities: ['M_extra-write'],
            },
            {
                namespace: 'valid-namespace-3',
                authorities: ['M_extra-readwrite'],
                writeAuthotities: ['M_extra-write'],
            },
        ]

        const output = parseAdditionalNamespaces(testNamespaces)
        expect(output).toEqual([testNamespaces[2], ...testNamespaces.slice(-2)])
        expect(reporter.warn).toHaveBeenCalledTimes(6)
    })
})
