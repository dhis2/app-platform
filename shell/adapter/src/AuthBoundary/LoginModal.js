import React, { useState } from 'react'
import i18n from '../locales'
import { Modal, Button, InputField } from '@dhis2/ui-core'

const staticUrl = process.env.REACT_APP_DHIS2_BASE_URL

export const LoginModal = ({ url }) => {
    const [server, setServer] = useState(
        staticUrl || window.localStorage.DHIS2_BASE_URL || ''
    )
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const isValid = val => val && val.length > 3

    const onSubmit = async e => {
        e.preventDefault()
        setIsDirty(true)
        if (isValid(server) && isValid(username) && isValid(password)) {
            window.localStorage.DHIS2_BASE_URL = server
            try {
                await fetch(
                    `${server}/dhis-web-commons-security/login.action`,
                    {
                        method: 'POST',
                        credentials: 'include',
                        body: `j_username=${username}&j_password=${password}`,
                        headers: {
                            'X-Requested-With': 'XMLHttpRequest',
                            Accept: 'application/json',
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                )
            } catch (e) {
                console.log(
                    'TODO: This will always error and cancel the request until we get a real login endpoint!'
                )
            }

            // TODO: Hacky solution... this shouldn't require a reload
            window.location.reload()
        }
    }

    return (
        <Modal open small>
            <form onSubmit={onSubmit}>
                <Modal.Title>{i18n.t('Please sign in')}</Modal.Title>
                <Modal.Content>
                    {!staticUrl && (
                        <InputField
                            error={isDirty && !isValid(server)}
                            label={i18n.t('Server')}
                            name="server"
                            type="text"
                            value={server}
                            onChange={input => setServer(input.value)}
                        />
                    )}
                    <InputField
                        error={isDirty && !isValid(username)}
                        label={i18n.t('Username')}
                        name="j_username"
                        type="text"
                        value={username}
                        onChange={input => setUsername(input.value)}
                    />
                    <InputField
                        error={isDirty && !isValid(password)}
                        label={i18n.t('Password')}
                        name="j_password"
                        type="password"
                        value={password}
                        onChange={input => setPassword(input.value)}
                    />
                </Modal.Content>
                <Modal.Actions>
                    <Button primary type="submit">
                        {i18n.t('Sign in')}
                    </Button>
                </Modal.Actions>
            </form>
        </Modal>
    )
}
