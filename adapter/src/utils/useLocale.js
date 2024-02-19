import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useState, useEffect } from 'react'
import {
    setI18nLocale,
    parseLocale,
    setDocumentDirection,
    setMomentLocale,
} from './localeUtils.js'

const useLocale = ({ userSettings, configDirection }) => {
    const [result, setResult] = useState({
        locale: undefined,
        direction: undefined,
    })

    useEffect(() => {
        if (!userSettings) {
            return
        }

        const locale = parseLocale(userSettings)

        setI18nLocale(locale)
        setMomentLocale(locale)

        // Intl.Locale dir utils aren't supported in firefox, so use i18n
        const localeDirection = i18n.dir(locale.language)
        setDocumentDirection({ localeDirection, configDirection })
        document.documentElement.setAttribute('lang', locale.baseName)

        setResult({ locale, direction: localeDirection })
    }, [userSettings, configDirection])

    return result
}

const settingsQuery = {
    userSettings: {
        resource: 'userSettings',
    },
}
// note: userSettings.keyUiLocale is expected to be in the Java format,
// e.g. 'ar', 'ar_IQ', 'uz_UZ_Cyrl', etc.
export const useCurrentUserLocale = (configDirection) => {
    const { loading, error, data } = useDataQuery(settingsQuery)
    const { locale, direction } = useLocale({
        userSettings: data && data.userSettings,
        configDirection,
    })

    if (error) {
        // This shouldn't happen, trigger the fatal error boundary
        throw new Error('Failed to fetch user locale: ' + error)
    }

    return { loading: loading || !locale, locale, direction }
}
