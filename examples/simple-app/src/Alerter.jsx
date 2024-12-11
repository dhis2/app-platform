import { useAlert } from '@dhis2/app-runtime'
import { InputField, CheckboxField, Button } from '@dhis2/ui'
import React, { useState } from 'react'
import styles from './Alerter.module.css'

export const Alerter = () => {
    const [message, setMessage] = useState('')
    const [critical, setCritical] = useState(false)

    const { show, hide } = useAlert(
        (str) => str,
        () => ({ critical })
    )

    return (
        <div className={styles.flexContainer}>
            <InputField
                placeholder="Type alert message"
                value={message}
                onChange={({ value }) => setMessage(value)}
            />
            <CheckboxField
                label="Critical"
                checked={critical}
                onChange={() => setCritical(!critical)}
            />
            <Button onClick={() => show(message)}>Show alert</Button>
            <Button onClick={hide}>Hide alert</Button>
        </div>
    )
}
