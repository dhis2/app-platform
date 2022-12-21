import { useDataEngine } from '@dhis2/app-runtime'
// importing from app-service-offline makes testing locally simpler
// todo: update import to app-runtime once app-runtime PR is merged
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

    // While testing this PR, uncomment this and the import to test once the
    // 'temp' scripts in pkg.json have been run:
    // const { isConnected, lastConnected } = useDhis2ConnectionStatus()
    const [isConnected, lastConnected] = [true, null]

    const internalRequest = () => {
        console.log('Request tester: internal request')
        engine.query(query)
    }
    const externalRequest = () => {
        console.log('Request tester: external request')
        fetch('https://random.dog/woof.json')
    }

    return (
        <div>
            <div>
                Connection to DHIS2 server:{' '}
                {isConnected ? (
                    <span style={{ color: 'green' }}>Connected</span>
                ) : (
                    <span style={{ color: 'red' }}>NOT CONNECTED</span>
                )}
            </div>
            <div>
                Last connected: {lastConnected?.toLocaleTimeString() || 'null'}
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
