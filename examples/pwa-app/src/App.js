import { OfflineProvider } from '@dhis2/app-service-offline'
import React from 'react'
import classes from './App.module.css'
import SectionWrapper from './components/SectionWrapper'
import { OfflineInterface } from './lib/offline-interface.js'
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
