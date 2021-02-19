import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useEffect } from 'react'

i18n.setDefaultNamespace('default')

const simplifyLocale = locale => {
    const idx = locale.indexOf('-')
    if (idx === -1) {
        return locale
    }
    return locale.substr(0, idx)
}

const setGlobalLocale = locale => {
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

export const useLocale = locale => {
    useEffect(() => {
        setGlobalLocale(locale || window.navigator.language)
    }, [locale])
}
