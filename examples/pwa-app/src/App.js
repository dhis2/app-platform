import React from 'react'
import classes from './App.module.css'
import SectionWrapper from './components/SectionWrapper'
import { CachedSectionsProvider } from './lib/cached-sections'
import {
    initOfflineInterface,
    OfflineInterfaceProvider,
} from './lib/offline-interface.js'

const offlineInterface = initOfflineInterface()

const MyApp = () => (
    <OfflineInterfaceProvider offlineInterface={offlineInterface}>
        <CachedSectionsProvider>
            <div className={classes.container}>
                <SectionWrapper id={'section-id-01'} />
            </div>
        </CachedSectionsProvider>
    </OfflineInterfaceProvider>
)

export default MyApp
