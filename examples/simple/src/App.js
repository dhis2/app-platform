import React from 'react'
import i18n from './locales'

const Component = ({ config }) => (
    <div
        style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <h1>{i18n.t('HELLO WORLD!')}</h1>
        <h3>DHIS2 URL: {config.url}</h3>
    </div>
)

export default Component
