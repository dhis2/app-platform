import React from 'react'
import moment from 'moment'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import style from './App.style'

const query = {
    me: {
        resource: 'me',
    },
}

const Component = () => {
    const { error, loading, data } = useDataQuery(query)
    return (
        <div>
            <style jsx>{style}</style>
            {error && <span>ERROR</span>}
            {loading && <span>...</span>}
            {data && (
                <>
                    <h1>{i18n.t('Hello {{name}}', { name: data.me.name })}</h1>
                    <h3>
                        {i18n.t('Have a great {{dayOfTheWeek}}!', {
                            dayOfTheWeek: moment.weekdays(true)[
                                moment().weekday()
                            ],
                        })}
                    </h3>
                </>
            )}
        </div>
    )
}

export default Component
