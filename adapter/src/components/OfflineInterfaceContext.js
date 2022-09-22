import { OfflineInterface } from '@dhis2/pwa'
import { createContext, useContext } from 'react'

const offlineInterface = new OfflineInterface()

const OfflineInterfaceContext = createContext(offlineInterface)

export const OfflineInterfaceProvider = OfflineInterfaceContext.Provider
export const useOfflineInterface = () => useContext(OfflineInterfaceContext)
