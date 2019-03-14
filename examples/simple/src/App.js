import React from 'react'
import i18n from './locales'

const Component = ({ config }) => (
    <div style={{ width: '100%', height: '100%' }}>
        <h1>{i18n.t('HELLO WORLD!')}</h1>
        <h3>DHIS2 URL: {config.url}</h3>
    </div>
)

export default Component
