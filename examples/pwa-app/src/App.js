import React from 'react'
import classes from './App.module.css'

import {
    makeOfflineInterface,
    OfflineInterfaceProvider,
} from './lib/offline-interface.js'
import CacheableComponent from './components/CacheableComponent'

const offlineInterface = makeOfflineInterface()

const MyApp = () => (
    <OfflineInterfaceProvider offlineInterface={offlineInterface}>
        <div className={classes.container}>
            <CacheableComponent />
        </div>
    </OfflineInterfaceProvider>
)

export default MyApp
