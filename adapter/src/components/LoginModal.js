import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    InputField,
} from '@dhis2/ui'
import React, { useState } from 'react'
import i18n from '../locales'
import { post } from '../utils/api'

const staticUrl = process.env.REACT_APP_DHIS2_BASE_URL

export const LoginModal = () => {
    const [server, setServer] = useState(
        staticUrl || window.localStorage.DHIS2_BASE_URL || ''
    )
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isDirty, setIsDirty] = useState(false)

    const isValid = val => val && val.length >= 2

    const onSubmit = async e => {
        e.preventDefault()
        setIsDirty(true)
        if (isValid(server) && isValid(username) && isValid(password)) {
            window.localStorage.DHIS2_BASE_URL = server
            try {
                await post(
                    `${server}/dhis-web-commons-security/login.action`,
                    `j_username=${encodeURIComponent(
                        username
                    )}&j_password=${encodeURIComponent(password)}`
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
        <Modal open small dataTest="dhis2-adapter-loginmodal">
            <form onSubmit={onSubmit}>
                <ModalTitle>{i18n.t('Please sign in')}</ModalTitle>

                <ModalContent>
                    {!staticUrl && (
                        <InputField
                            dataTest="dhis2-adapter-loginserver"
                            error={isDirty && !isValid(server)}
                            label={i18n.t('Server')}
                            name="server"
                            type="text"
                            value={server}
                            onChange={input => setServer(input.value)}
                        />
                    )}

                    <InputField
                        dataTest="dhis2-adapter-loginname"
                        error={isDirty && !isValid(username)}
                        label={i18n.t('Username')}
                        name="j_username"
                        type="text"
                        value={username}
                        onChange={input => setUsername(input.value)}
                    />

                    <InputField
                        dataTest="dhis2-adapter-loginpassword"
                        error={isDirty && !isValid(password)}
                        label={i18n.t('Password')}
                        name="j_password"
                        type="password"
                        value={password}
                        onChange={input => setPassword(input.value)}
                    />
                </ModalContent>

                <ModalActions>
                    <Button
                        primary
                        dataTest="dhis2-adapter-loginsubmit"
                        type="submit"
                    >
                        {i18n.t('Sign in')}
                    </Button>
                </ModalActions>
            </form>
        </Modal>
    )
}
