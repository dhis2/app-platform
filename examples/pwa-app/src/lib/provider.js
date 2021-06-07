import PropTypes from 'prop-types'
import React from 'react'
import { RecordingStatesProvider } from './cacheable-section'
import { CachedSectionsProvider } from './cached-sections'
import { OfflineInterfaceProvider } from './offline-interface'

export function OfflineProvider({ offlineInterface, pwaEnabled, children }) {
    return (
        <OfflineInterfaceProvider
            offlineInterface={offlineInterface}
            pwaEnabled={pwaEnabled}
        >
            <RecordingStatesProvider>
                <CachedSectionsProvider>{children}</CachedSectionsProvider>
            </RecordingStatesProvider>
        </OfflineInterfaceProvider>
    )
}

OfflineProvider.propTypes = {
    children: PropTypes.node,
    offlineInterface: PropTypes.shape({}),
    pwaEnabled: PropTypes.bool,
}
