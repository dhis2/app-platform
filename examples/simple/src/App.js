import React from 'react'
import i18n from './locales'
import { DataQuery } from '@dhis2/app-runtime'

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

const FailureMessage = ({ baseUrl }) => (
    <span
        style={{ color: 'red', fontSize: 18, margin: 16, textAlign: 'center' }}
    >
        {i18n.t('Failed to load!')}
        <br />
        <a target="_blank" rel="noopener noreferrer" href={`${baseUrl}`}>
            {i18n.t('Click here to login')}
        </a>
    </span>
)
const Component = ({ config }) => (
    <div style={style}>
        <DataQuery
            query={{
                me: {
                    resource: 'me',
                },
            }}
        >
            {({ error, loading, data }) => {
                if (error) return <FailureMessage baseUrl={config.url} />
                if (loading) return <span style={{ color: 'yellow' }}>...</span>
                return (
                    <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
                )
            }}
        </DataQuery>
    </div>
)

export default Component
