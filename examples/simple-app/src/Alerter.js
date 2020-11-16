import React, { useState } from 'react'
import { useAlert } from '@dhis2/app-runtime'
import { InputField, Button } from '@dhis2/ui'

export const Alerter = () => {
    const [message, setMessage] = useState('')
    const { show } = useAlert(str => str)

    return (
        <div>
            <InputField
                placeholder="Type alert message"
                value={message}
                onChange={({ value }) => setMessage(value)}
            />
            <Button onClick={() => show(message)}>Show alert</Button>
            <style jsx>{`
                div {
                    display: flex;
                    align-items: baseline;
                }
            `}</style>
        </div>
    )
}
