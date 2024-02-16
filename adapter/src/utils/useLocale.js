import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useState, useEffect } from 'react'

i18n.setDefaultNamespace('default')

const simplifyLocale = (locale) => {
    const idx = locale.indexOf('-')
    if (idx === -1) {
        return locale
    }
    return locale.substr(0, idx)
}

const setGlobalLocale = (locale) => {
    if (locale !== 'en' && locale !== 'en-us') {
        import(
            /* webpackChunkName: "moment-locales/[request]" */ `moment/locale/${locale}`
        ).catch(() => {
            /* ignore */
        })
    }
    moment.locale(locale)

    const simplifiedLocale = simplifyLocale(locale)
    i18n.changeLanguage(simplifiedLocale)
}

export const useLocale = (locale) => {
    const [result, setResult] = useState(undefined)
    useEffect(() => {
        if (!locale) {
            return
        }

        setGlobalLocale(locale)
        setResult(locale)

        console.log('🗺 Global d2-i18n locale initialized:', locale)
    }, [locale])
    return result
}

const settingsQuery = {
    userSettings: {
        resource: 'userSettings',
    },
}
export const useCurrentUserLocale = () => {
    const { loading, error, data } = useDataQuery(settingsQuery)
    const locale = useLocale(
        data && (data.userSettings.keyUiLocale || window.navigator.language)
    )

    if (error) {
        // This shouldn't happen, trigger the fatal error boundary
        throw new Error('Failed to fetch user locale: ' + error)
    }

    return { loading: loading || !locale, locale }
}

const loginConfigQuery = {
    loginConfig: {
        resource: 'loginConfig',
    },
}
export const useSystemDefaultLocale = () => {
    // TO-DO: system language query (not currently available)
    const { loading, data, error } = useDataQuery(loginConfigQuery)
    // use uiLocale from query, if not fall back to window.navigator.language
    // do not triger error boundary for login app
    const locale = useLocale(
        (data || error) &&
            (data?.loginConfig?.uiLocale || window.navigator.language)
    )
    return { loading: loading || !locale, locale }
}
