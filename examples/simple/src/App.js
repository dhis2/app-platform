import React from 'react'
import i18n from './locales'

const style = {
    position: 'absolute',
    top: 48,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1rem',
}

const Component = ({ config }) => (
    <div style={style}>
        <h1>{i18n.t('HELLO WORLD!')}</h1>
        <h3>DHIS2 URL: {config.url}</h3>
    </div>
)

export default Component
