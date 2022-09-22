import { useConfig } from '@dhis2/app-runtime'
import { HeaderBar } from '@dhis2/ui'
import React from 'react'
import { usePWAUpdateState } from '../utils/usePWAUpdateState'
import { ConfirmUpdateModal } from './ConfirmUpdateModal'

/**
 * Check for SW updates or a first activation, displaying an update notification
 * message in the HeaderBar profile menu. When an update is applied, if there are
 * multiple tabs of this app open, there's anadditional warning step because all
 * clients of the service worker will reload when there's an update, which may
 * cause data loss.
 */

export function ConnectedHeaderBar() {
    const { appName } = useConfig()
    const {
        updateAvailable,
        confirmReload,
        confirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    } = usePWAUpdateState()

    return (
        <>
            <HeaderBar
                appName={appName}
                updateAvailable={updateAvailable}
                onApplyAvailableUpdate={confirmReload}
            />
            {confirmationRequired ? (
                <ConfirmUpdateModal
                    clientsCount={clientsCount}
                    onConfirm={onConfirmUpdate}
                    onCancel={onCancelUpdate}
                />
            ) : null}
        </>
    )
}
