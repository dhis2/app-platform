import { useDataQuery } from '@dhis2/app-runtime'
import moment from 'moment'
import React from 'react'
import { Alerter } from './Alerter.jsx'
import styles from './App.module.css'
import i18n from './locales/index.js'

const query = {
    me: {
        resource: 'me',
    },
}

const Component = () => {
    const { error, loading, data } = useDataQuery(query)

    return (
        <div className={styles.appContainer}>
            {error && <span>ERROR</span>}
            {loading && <span>...</span>}
            {data && (
                <>
                    <h1>
                        {i18n.t('Hello {{name}}', { name: data.me.name })}
                    </h1>
                    <h3>
                        {i18n.t('Have a great {{dayOfTheWeek}}!', {
                            // NB: This won't localize on a dev build due to
                            // Vite's monorepo dep pre-bundling behavior.
                            // `moment` localization works outside the monorepo
                            // and in production here though
                            dayOfTheWeek:
                                moment.weekdays(true)[moment().weekday()],
                        })}
                    </h3>
                    <Alerter />
                </>
            )}
        </div>
    )
}

export default Component
