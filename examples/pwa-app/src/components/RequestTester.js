import { useDataEngine } from '@dhis2/app-runtime'
// import { useDhis2ConnectionStatus } from '@dhis2/app-service-offline'
import { Button } from '@dhis2/ui'
import React from 'react'

const query = {
    me: {
        resource: 'me',
        params: {
            fields: ['id', 'name'],
        },
    },
}

export default function RequestTester() {
    const engine = useDataEngine()
    // const { isConnectedToDhis2 } = useDhis2ConnectionStatus()

    const internalRequest = () => {
        console.log('internal request')
        engine.query(query)
    }
    const externalRequest = () => {
        console.log('external request')
        fetch('https://random.dog/woof.json')
    }

    return (
        <div>
            <p>
                Request Tester.{' '}
                {/* {isConnectedToDhis2 ? 'Connected' : 'NOT CONNECTED'} */}
            </p>
            <Button onClick={internalRequest}>Internal Request</Button>
            <Button onClick={externalRequest}>External Request</Button>
        </div>
    )
}
