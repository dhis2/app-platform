import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'
// import { OfflineInterface } from '../offline-interface/offline-interface.js'

// todo: instantiating the offline interface here creates a side-effect where
// it is bundled in the service worker, which causes an error when the `window`
// API is referenced -- fix that side effect
// const theOfflineInterface = null // new OfflineInterface()

const OfflineInterfaceContext = createContext(null)

export const OfflineInterfaceProvider = ({ offlineInterface, children }) => {
    console.log({ offlineInterface })
    return (
        <OfflineInterfaceContext.Provider value={offlineInterface}>
            {children}
        </OfflineInterfaceContext.Provider>
    )
}

OfflineInterfaceProvider.propTypes = {
    children: PropTypes.node,
    offlineInterface: PropTypes.object,
}

export const useOfflineInterface = () => useContext(OfflineInterfaceContext)
