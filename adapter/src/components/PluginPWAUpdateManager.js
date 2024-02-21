import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { usePWAUpdateState } from '../utils/usePWAUpdateState'
import { ConfirmUpdateModal } from './ConfirmUpdateModal'

/**
 * Analogous to the ConnectedHeaderbar, for use in plugins since they don't
 * use a header bar. See the ConnectedHeaderBar for more
 */

/**
 * Check for SW updates or a first activation, displaying an update notification
 * message in the HeaderBar profile menu. When an update is applied, if there are
 * multiple tabs of this app open, there's anadditional warning step because all
 * clients of the service worker will reload when there's an update, which may
 * cause data loss.
 */

export function PluginPWAUpdateManager({ reportPWAUpdateStatus }) {
    const {
        updateAvailable,
        confirmReload,
        confirmationRequired,
        clientsCount,
        onConfirmUpdate,
        onCancelUpdate,
    } = usePWAUpdateState()

    useEffect(() => {
        if (reportPWAUpdateStatus) {
            reportPWAUpdateStatus({
                updateAvailable,
                onApplyUpdate: updateAvailable ? confirmReload : null,
            })
        }
    }, [updateAvailable, confirmReload, reportPWAUpdateStatus])

    return confirmationRequired ? (
        <ConfirmUpdateModal
            clientsCount={clientsCount}
            onConfirm={onConfirmUpdate}
            onCancel={onCancelUpdate}
        />
    ) : null
}
PluginPWAUpdateManager.propTypes = {
    reportPWAUpdateStatus: PropTypes.func,
}
