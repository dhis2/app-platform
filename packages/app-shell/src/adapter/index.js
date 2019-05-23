import React from 'react'
import { HeaderBar } from '@dhis2/ui-widgets'
import { DataProvider } from '@dhis2/app-runtime'

const App = ({ url, appName, children }) => (
    <DataProvider baseUrl={url} apiVersion={32}>
        <HeaderBar appName={appName} />
        {children}
    </DataProvider>
)

export default App
