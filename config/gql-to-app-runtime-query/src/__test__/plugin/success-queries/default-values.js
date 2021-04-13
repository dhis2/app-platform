import { gql } from '@dhis2/app-runtime'

const query = gql`
    query queryName(
        $test: String = "test",
        $foo: Object = { foo: "bar", bar: { baz: "baz" } }
    ) {
        SmsCommand(
            resource: "smsCommands",
            params: {
                test: $test
            }
        ) {
            __all
        }
    }
`
