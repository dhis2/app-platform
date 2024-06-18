import { setBaseUrlByAppName } from '@dhis2/pwa'
import {
    Modal,
    ModalTitle,
    ModalContent,
    ModalActions,
    Button,
    InputField,
    NoticeBox,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import i18n from '../locales/index.js'
import { get, post, postJSON } from '../utils/api.js'
import { styles } from './styles/LoginModal.style.js'

// Check if base URL is set statically as an env var (typical in production)
const staticUrl = process.env.REACT_APP_DHIS2_BASE_URL

const getIsNewLoginAPIAvailable = async (server) => {
    try {
        // if loginConfig is available, the instance can use new endpoints
        await get(`${server}/api/loginConfig`)
        return true
    } catch (e) {
        // if loginConfig is not available, the instance must use old endpoints
        console.error(e)
        return false
    }
}

const loginWithNewEndpoints = async ({
    server,
    username,
    password,
    setError,
    setIsLoggingIn,
}) => {
    try {
        await postJSON(
            `${server}/api/auth/login`,
            JSON.stringify({
                username,
                password,
            })
        )
        window.location.reload()
    } catch (e) {
        setError(e)
        setIsLoggingIn(false)
    }
}

const loginWithOldEndpoints = async ({ server, username, password }) => {
    try {
        await post(
            `${server}/dhis-web-commons-security/login.action`,
            `j_username=${encodeURIComponent(
                username
            )}&j_password=${encodeURIComponent(password)}`
        )
    } catch (e) {
        console.error(e)
    } finally {
        window.location.reload()
    }
}

export const LoginModal = ({ appName, baseUrl, loginApp = false }) => {
    const [server, setServer] = useState(baseUrl || '')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [isDirty, setIsDirty] = useState(false)
    const [error, setError] = useState(null)
    const [isLoggingIn, setIsLoggingIn] = useState(false)

    const isValid = (val) => val && val.length >= 2
    const getSignInButtonText = ({ loginApp, isLoggingIn }) => {
        if (!loginApp) {
            return isLoggingIn ? i18n.t('Signing in...') : i18n.t('Sign in')
        }
        return isLoggingIn ? i18n.t('Going to app...') : i18n.t('Go to app')
    }

    const onSubmit = async (e) => {
        e.preventDefault()
        setIsDirty(true)
        if (
            isValid(server) &&
            ((isValid(username) && isValid(password)) || loginApp)
        ) {
            setIsLoggingIn(true)
            if (!staticUrl) {
                // keep the localStorage value here -- it's still used in some
                // obscure cases, like in the cypress network shim
                window.localStorage.DHIS2_BASE_URL = server
                await setBaseUrlByAppName({ appName, baseUrl: server })
                if (loginApp) {
                    window.location.reload()
                }
            }

            const isNewLoginAPIAvailable = await getIsNewLoginAPIAvailable(
                server
            )

            if (isNewLoginAPIAvailable) {
                loginWithNewEndpoints({
                    server,
                    username,
                    password,
                    setError,
                    setIsLoggingIn,
                })
            } else {
                loginWithOldEndpoints({ server, username, password })
            }
        }
    }

    return (
        <Modal open small dataTest="dhis2-adapter-loginmodal">
            <style jsx>{styles}</style>
            <form onSubmit={onSubmit}>
                <ModalTitle>
                    {!loginApp
                        ? i18n.t('Please sign in')
                        : i18n.t('Specify server')}
                </ModalTitle>

                <ModalContent>
                    {error && (
                        <div className="errorNotification">
                            <NoticeBox error title={i18n.t('Could not log in')}>
                                {error?.message}
                            </NoticeBox>
                        </div>
                    )}
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
                    {!loginApp && (
                        <>
                            <InputField
                                dataTest="dhis2-adapter-loginname"
                                error={isDirty && !isValid(username)}
                                label={i18n.t('Username')}
                                name="j_username"
                                type="text"
                                value={username}
                                onChange={(input) => setUsername(input.value)}
                            />

                            <InputField
                                dataTest="dhis2-adapter-loginpassword"
                                error={isDirty && !isValid(password)}
                                label={i18n.t('Password')}
                                name="j_password"
                                type="password"
                                value={password}
                                onChange={(input) => setPassword(input.value)}
                            />
                        </>
                    )}
                </ModalContent>

                <ModalActions>
                    <Button
                        primary
                        dataTest="dhis2-adapter-loginsubmit"
                        type="submit"
                        disabled={isLoggingIn}
                    >
                        {getSignInButtonText({ loginApp, isLoggingIn })}
                    </Button>
                </ModalActions>
            </form>
        </Modal>
    )
}
LoginModal.propTypes = {
    appName: PropTypes.string,
    baseUrl: PropTypes.string,
    loginApp: PropTypes.bool,
}
