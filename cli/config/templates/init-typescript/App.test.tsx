import { CustomDataProvider } from '@dhis2/app-runtime'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

it('renders without crashing', () => {
    const container = document.createElement('div')

    const data = {
        resource: 'test',
    }

    const root = createRoot(container)
    root.render(
        <CustomDataProvider data={data}>
            <App />
        </CustomDataProvider>
    )

    root.unmount()
})
