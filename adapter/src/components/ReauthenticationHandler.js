import { useAlert, useConfig } from '@dhis2/app-runtime'
import { useEffect, useState } from 'react'
import i18n from '../locales/index.js'
import { LoginModal } from './LoginModal.js'

export const ReauthenticationHandler = ({ user }) => {
    console.log(user)
    const config = useConfig()
    const [authenticated, setAuthenticated] = useState(false)
    const [loginRequested, setLoginRequested] = useState(false)
    const { show, hide } = useAlert(i18n.t('You have been signed out'), {
        warning: true,
        permanent: true,
        actions: [
            {
                label: i18n.t('Sign back in'),
                onClick: () => {
                    setLoginRequested(true)
                },
            },
        ],
    })

    useEffect(() => {
        if (!authenticated) {
            show()
        }
    }, [authenticated])

    return loginRequested ? (
        <LoginModal server={config.baseUrl} username={user.username} onLoginSuccess={() => {
            setLoginRequested(false)
            hide()
        }} onCancel={() => {
            setLoginRequested(false)
            show()
        }} />
    ) : null
}
