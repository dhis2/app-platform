import { gql } from '@dhis2/app-runtime'

const query = gql`
    query queryName($id: String = 42) {
        SmsCommand(resource: "smsCommands", id: $id) {
            __all
        }
    }
`
