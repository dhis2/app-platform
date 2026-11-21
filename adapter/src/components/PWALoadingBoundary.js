import {
    useOfflineInterface,
    REGISTRATION_STATE_WAITING,
    REGISTRATION_STATE_FIRST_ACTIVATION,
} from '@dhis2/pwa'
import PropTypes from 'prop-types'
import { useEffect, useState } from 'react'

export const PWALoadingBoundary = ({ children }) => {
    const [pwaReady, setPWAReady] = useState(false)
    const offlineInterface = useOfflineInterface()

    useEffect(() => {
        const checkRegistration = async () => {
            const registrationState =
                await offlineInterface.getRegistrationState()
            const clientsInfo = await offlineInterface.getClientsInfo()
            if (
                (registrationState === REGISTRATION_STATE_WAITING ||
                    registrationState ===
                        REGISTRATION_STATE_FIRST_ACTIVATION) &&
                clientsInfo.clientsCount === 1
            ) {
                console.log(
                    'Reloading on startup to activate waiting service worker'
                )
                offlineInterface.useNewSW()
            } else {
                setPWAReady(true)
            }
        }
        checkRegistration().catch((err) => {
            console.error(err)
            setPWAReady(true)
        })
    }, [offlineInterface])

    return pwaReady ? children : null
}

PWALoadingBoundary.propTypes = {
    children: PropTypes.node.isRequired,
}
