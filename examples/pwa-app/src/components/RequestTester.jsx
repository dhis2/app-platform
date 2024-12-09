import { useDataEngine, useDhis2ConnectionStatus } from '@dhis2/app-runtime'
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
    const { isConnected, lastConnected } = useDhis2ConnectionStatus()

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
