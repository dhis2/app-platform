import { getAuthoritiesFromSchema } from '../getAuthoritiesFromSchema'

describe('getAuthoritiesFromSchema', () => {
    const createPublicAuthorities = ['F_FOO_PUBLIC_ADD']
    const createPrivateAuthorities = ['F_FOO_PRIVATE_ADD']
    const deleteAuthorities = ['F_FOO_DELETE']

    const schema = {
        authorities: [
            {
                type: 'CREATE_PUBLIC',
                authorities: createPublicAuthorities,
            },
            {
                type: 'CREATE_PRIVATE',
                authorities: createPrivateAuthorities,
            },
            {
                type: 'DELETE',
                authorities: deleteAuthorities,
            },
        ],
    }

    it('should return all the authorities from a schema', () => {
        const extractedAuthorities = getAuthoritiesFromSchema(schema)

        expect(extractedAuthorities).toEqual([
            createPublicAuthorities,
            createPrivateAuthorities,
            deleteAuthorities,
        ])
    })
})
