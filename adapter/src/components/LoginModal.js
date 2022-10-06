import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    InputField,
    ButtonStrip,
    CheckboxField,
} from '@dhis2/ui'
import React, { useState } from 'react'
import i18n from '../locales/index.js'
import { attemptLogin } from '../utils/api.js'

export const LoginModal = ({
    server: staticUrl,
    username: staticUsername,
    onLoginSuccess,
    onLoginFailure,
    onCancel,
} = {}) => {
    const [server, setServer] = useState(
        staticUrl || window.localStorage.DHIS2_BASE_URL || ''
    )
    const [username, setUsername] = useState(staticUsername || '')
    const [password, setPassword] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [mfaChecked, setMfaChecked] = useState(false)
    const [mfaToken, setMfaToken] = useState(undefined)

    const isValid = (val) => val && val.length >= 2

    const onSubmit = async (e) => {
        e.preventDefault()
        setIsDirty(true)
        if (isValid(server) && isValid(username) && isValid(password)) {
            if (!staticUrl) {
                window.localStorage.DHIS2_BASE_URL = server
            }
            await attemptLogin({
                server,
                username,
                password,
                mfaToken,
                onSuccess: () => {
                    setIsDirty(false)
                    setPassword('')
                    setMfaToken(undefined)
                    onLoginSuccess && onLoginSuccess()
                },
                onFailure: () => {
                    setPassword('')
                    setMfaToken(undefined)
                    onLoginFailure && onLoginFailure()
                }
            })
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
                                onChange={(input) => setServer(input.value)}
                            />
                        )}

                        <InputField
                            dataTest="dhis2-adapter-loginname"
                            error={isDirty && !isValid(username)}
                            label={i18n.t('Username')}
                            disabled={staticUsername}
                            type="text"
                            value={username}
                            onChange={(input) => setUsername(input.value)}
                        />

                        <InputField
                            dataTest="dhis2-adapter-loginpassword"
                            error={isDirty && !isValid(password)}
                            label={i18n.t('Password')}
                            type="password"
                            value={password}
                            onChange={(input) => setPassword(input.value)}
                        />
                        <CheckboxField
                            dataTest="dhis2-adapter-login-mfacheck"
                            label={i18n.t('Login using two factor authentication')}
                            checked={mfaChecked}
                            onChange={(input) => {
                                !input.checked && setMfaToken(undefined)
                                setMfaChecked(input.checked)
                            }}
                        />
                        {mfaChecked && (
                            <InputField dataTest="dhis2-adapter-login-mfatoken"
                                label={i18n.t('Two factor authentication code')}
                                error={isDirty && mfaChecked && !isValid(mfaToken)}
                                value={mfaToken}
                                type="text"
                                onChange={(input) => setMfaToken(input.value)}
                            />
                        )}
                </ModalContent>

                <ModalActions>
                    <ButtonStrip>
                        {onCancel && (
                            <Button onClick={onCancel}>
                                {i18n.t('Cancel')}
                            </Button>
                        )}
                        <Button
                            primary
                            dataTest="dhis2-adapter-loginsubmit"
                            type="submit"
                        >
                            {i18n.t('Sign in')}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </form>
        </Modal>
    )
}
