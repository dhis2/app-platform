import { useEffect, useState } from 'react'
import { useOfflineInterface } from '../components/OfflineInterfaceContext'

export const usePWAUpdateState = () => {
    const offlineInterface = useOfflineInterface()
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [clientsCount, setClientsCount] = useState(null)

    const onConfirmUpdate = () => {
        offlineInterface.useNewSW()
    }
    const onCancelUpdate = () => {
        setClientsCount(null)
    }

    const confirmReload = () => {
        offlineInterface
            .getClientsInfo()
            .then(({ clientsCount }) => {
                if (clientsCount === 1) {
                    // Just one client; go ahead and reload
                    onConfirmUpdate()
                } else {
                    // Multiple clients; warn about data loss before reloading
                    setClientsCount(clientsCount)
                }
            })
            .catch((reason) => {
                // Didn't get clients info
                console.warn(reason)

                // Go ahead with confirmation modal with `0` as clientsCount
                setClientsCount(0)
            })
    }

    useEffect(() => {
        offlineInterface.checkForNewSW({
            onNewSW: () => {
                setUpdateAvailable(true)
            },
        })
    }, [offlineInterface])

    const confirmationRequired = clientsCount !== null
    return {
        updateAvailable,
        confirmReload,
        confirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    }
}
