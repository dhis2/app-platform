import React from 'react'
import classes from './App.module.css'

import {
    makeOfflineInterface,
    OfflineInterfaceProvider,
} from './lib/offline-interface.js'
import SectionWrapper from './components/SectionWrapper'
import { CachedSectionsProvider } from './lib/cached-sections'

const offlineInterface = makeOfflineInterface()

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
