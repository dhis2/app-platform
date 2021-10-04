import { useAlert } from '@dhis2/app-runtime'
import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { useState, useEffect } from 'react'
import i18n from '../locales'

function ConfirmReloadModal({ clientsCount, onCancel, onConfirm }) {
    return (
        <Modal position="middle">
            <ModalTitle>{i18n.t('Save your data')}</ModalTitle>
            <ModalContent>
                {i18n.t(
                    "Updating will reload all {{n}} open instances of this app, and any unsaved data will be lost. Save any data you need to, then click 'Reload' when ready.",
                    { n: clientsCount }
                )}
            </ModalContent>
            <ModalActions>
                <ButtonStrip end>
                    <Button onClick={onCancel}>{i18n.t('Cancel')}</Button>
                    <Button destructive onClick={onConfirm}>
                        {i18n.t('Reload')}
                    </Button>
                </ButtonStrip>
            </ModalActions>
        </Modal>
    )
}
ConfirmReloadModal.propTypes = {
    clientsCount: PropTypes.number,
    onCancel: PropTypes.func,
    onConfirm: PropTypes.func,
}

/**
 * Uses the offlineInterface to check for SW updates or a first activation,
 * then prompts the user to reload the page to use the new SW and access new
 * app updates. If there are multiple tabs of this app open, there's an
 * additional warning step because all clients of the service worker will
 * reload when there's an update, which may cause data loss.
 */
export default function PWAUpdateManager({ offlineInterface }) {
    const [confirmReloadModalOpen, setConfirmReloadModalOpen] = useState(false)
    const [clientsCountState, setClientsCountState] = useState(1)
    const { show } = useAlert(
        i18n.t("There's an update available for this app."),
        ({ onConfirm }) => ({
            permanent: true,
            actions: [
                { label: i18n.t('Update and reload'), onClick: onConfirm },
                { label: i18n.t('Not now'), onClick: () => {} },
            ],
        })
    )

    const confirmReload = async () => {
        const { clientsCount } = await offlineInterface.getClientsInfo()
        setClientsCountState(clientsCount)
        if (clientsCount <= 1) {
            // Just one client; go ahead and reload
            offlineInterface.useNewSW()
        } else {
            // Multiple clients open; warn about data loss before reloading
            setConfirmReloadModalOpen(true)
        }
    }

    useEffect(() => {
        offlineInterface.checkForNewSW({
            onNewSW: () => {
                show({ onConfirm: confirmReload })
            },
        })
    }, [])

    return confirmReloadModalOpen ? (
        <ConfirmReloadModal
            onConfirm={() => offlineInterface.useNewSW()}
            onCancel={() => setConfirmReloadModalOpen(false)}
            clientsCount={clientsCountState}
        />
    ) : null
}
PWAUpdateManager.propTypes = {
    offlineInterface: PropTypes.shape({
        checkForNewSW: PropTypes.func,
        getClientsInfo: PropTypes.func,
        useNewSW: PropTypes.func,
    }),
}
