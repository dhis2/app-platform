import React from 'react'
import classes from './App.module.css'
import SectionWrapper from './components/SectionWrapper'
import { RecordingStatesProvider } from './lib/cacheable-section.js'
import { CachedSectionsProvider } from './lib/cached-sections.js'
import {
    OfflineInterface,
    OfflineInterfaceProvider,
} from './lib/offline-interface.js'
import { OfflineProvider } from './lib/provider.js'
import './locales'

const offlineInterface = new OfflineInterface()

const MyApp = () => (
    <OfflineProvider offlineInterface={offlineInterface}>
        <div className={classes.container}>
            <SectionWrapper id={'section-id-01'} />
        </div>
    </OfflineProvider>
)

export default MyApp
