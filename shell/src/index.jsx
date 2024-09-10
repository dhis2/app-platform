import { CssReset } from '@dhis2/ui'
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import 'typeface-roboto'
import './index.css'

const container = document.getElementById('dhis2-app-root')
const root = createRoot(container)
root.render(
    <>
        <CssReset />
        <App />
    </>
)

// ToDo: remove before merging
console.log('     ::: using react@18 :::')
