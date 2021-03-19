const babel = require('@babel/core')
const { gqlToAppRuntimeQuery } = require('../gqlToAppRuntimeQuery')

describe('gqlToAppRuntimeQuery', () => {
    const transform = code =>
        babel.transformSync(code, {
            plugins: [gqlToAppRuntimeQuery],
        })

    it('should replace the graphql query with an app-runtime query', () => {
        const code = `
            const query = gql\`
                query queryName(
                    $id: ID!,
                    $test: String = "test",
                    $foo: Object = {
                        foo: "bar"
                    },
                    $bar: Array = [
                        "foo",
                        "bar"
                    ]
                ) {
                    DataElement(
                        resource: "dataElements",
                        id: $id,
                        params: {
                            test: $test,
                            paging: "false",
                        }
                    ) {
                        __all
                        id
                        displayName
                        prop {
                            id
                            displayName
                            prop2 {
                                __all
                                id
                                displayName
                            }
                        }
                    }

                    Sms(
                        resource: "sms/outbound",
                        params: {
                            paging: "false"
                        }
                    ) {
                        __all
                    }
                }
            \`
        `

        // const expected = `
        //     const query = {
        //         DataElement: {
        //             resource: 'dataElements',
        //             id: ({ id }) => id,
        //             params: {
        //                 paging: "false",
        //                 fields: [
        //                     '*',
        //                     'id',
        //                     'displayName',
        //                 ],
        //             },
        //         },
        //         Sms: {
        //             resource: 'sms/outbound',
        //             params: {
        //                 paging: "false",
        //                 fields: ['*'],
        //             },
        //         },
        //     }
        // `

        transform(code)
        // const actual = transform(code)
        // expect(actual).toBe(expected)
    })
})
