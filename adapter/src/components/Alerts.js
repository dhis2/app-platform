import React from 'react'
import { useAlerts } from '@dhis2/app-runtime'
import { AlertBar, AlertStack } from '@dhis2/ui'

export const Alerts = () => {
    const alerts = useAlerts()

    return (
        <AlertStack>
            {alerts.map(
                ({ message, remove, id, options: { onHidden, ...props } }) => (
                    <AlertBar
                        {...props}
                        key={id}
                        onHidden={() => {
                            onHidden && onHidden()
                            remove()
                        }}
                    >
                        {message}
                    </AlertBar>
                )
            )}
        </AlertStack>
    )
}
