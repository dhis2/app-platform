import { CustomDataProvider } from '@dhis2/app-runtime'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

it('renders without crashing', () => {
    const div = document.createElement('div')

    const data = {
        resource: 'test',
    }

    ReactDOM.render(
        <CustomDataProvider data={data}>
            <App />
        </CustomDataProvider>,
        div
    )
    ReactDOM.unmountComponentAtNode(div)
})
