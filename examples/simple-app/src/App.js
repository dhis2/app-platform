import React from 'react'
import i18n from './locales'
import { DataQuery } from '@dhis2/app-runtime'
import style from './App.style'

const Component = () => (
    <div style={style}>
        <DataQuery
            query={{
                me: {
                    resource: 'me',
                },
            }}
        >
            {({ error, loading, data }) => {
                if (error) return <span>ERROR</span>
                if (loading) return <span>...</span>
                return (
                    <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
                )
            }}
        </DataQuery>
    </div>
)

export default Component
