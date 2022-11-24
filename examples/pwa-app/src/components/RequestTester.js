import { useDataEngine } from '@dhis2/app-runtime'
// import { useDhis2ConnectionStatus } from '@dhis2/app-service-offline'
import { Box, Button, ButtonStrip, Help } from '@dhis2/ui'
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
    const isConnectedToDhis2 = true

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
            <div>
                Connection to DHIS2 server:{' '}
                {isConnectedToDhis2 ? (
                    <span style={{ color: 'green' }}>Connected</span>
                ) : (
                    <span style={{ color: 'red' }}>NOT CONNECTED</span>
                )}
            </div>
            <Help>Based on useDhis2ConnectionStatus()</Help>
            <Box marginTop={'12px'}>
                <ButtonStrip>
                    <Button onClick={internalRequest}>
                        Query DHIS2 server
                    </Button>
                    <Button onClick={externalRequest}>
                        Query external server
                    </Button>
                </ButtonStrip>
            </Box>
        </div>
    )
}
