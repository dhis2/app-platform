import React from 'react'
import PropTypes from 'prop-types'
import { OfflineInterface } from '@dhis2/pwa'
import { createContext, useContext } from 'react'

const theOfflineInterface = new OfflineInterface()
const OfflineInterfaceContext = createContext(theOfflineInterface)

export const OfflineInterfaceProvider = ({ children }) => 
    <OfflineInterfaceContext.Provider value={theOfflineInterface}>
        {children}
    </OfflineInterfaceContext.Provider>

OfflineInterfaceProvider.propTypes = {
    children: PropTypes.node,
}

export const useOfflineInterface = () => useContext(OfflineInterfaceContext)
