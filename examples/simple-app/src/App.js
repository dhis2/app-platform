import React from 'react'
import i18n from './locales'
import { useDataQuery } from '@dhis2/app-runtime'
import style from './App.style'

const query = {
    me: {
        resource: 'me',
    },
}

const Component = () => {
    const { error, loading, data } = useDataQuery(query)
    return (
        <div style={style}>
            {error && <span>ERROR</span>}
            {loading && <span>...</span>}
            {data && (
                <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
            )}
        </div>
    )
}

export default Component
