import { CustomDataProvider } from '@dhis2/app-runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

it('renders without crashing', () => {
    const div = document.createElement('div')
    const root = createRoot(div)

    root.render(
        <CustomDataProvider>
            <App />
        </CustomDataProvider>
    )
    root.unmount()
})
