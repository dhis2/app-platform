import PropTypes from 'prop-types'
import React, { createContext, useContext } from 'react'
import { OfflineInterface } from '../offline-interface/offline-interface.js'

const OfflineInterfaceContext = createContext(null)

// nb: instantiating an offline interface here creates a side-effect where
// it is bundled in the service worker, which causes an error when the `window`
// API is referenced.
// It seems like some react and prop types leaks into the SW as well, which is
// interesting because other exports like from registration.js don't
let theOfflineInterface = null

export const OfflineInterfaceProvider = ({ children }) => {
    if (theOfflineInterface === null) {
        theOfflineInterface = new OfflineInterface()
    }

    return (
        <OfflineInterfaceContext.Provider value={theOfflineInterface}>
            {children}
        </OfflineInterfaceContext.Provider>
    )
}

OfflineInterfaceProvider.propTypes = { children: PropTypes.node }

export const useOfflineInterface = () => useContext(OfflineInterfaceContext)
