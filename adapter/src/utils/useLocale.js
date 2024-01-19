import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useState, useEffect } from 'react'

const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

// if translation resources aren't found for the given locale, try shorter
// versions of the locale
// e.g. 'pt_BR_Cyrl_asdf' => 'pt_BR', or 'ar-NotFound' => 'ar'
const validateLocaleByBundle = (locale) => {
    if (i18n.hasResourceBundle(locale, I18N_NAMESPACE)) {
        return locale
    }

    console.log(`Translations for locale ${locale} not found`)

    // see if we can try basic versions of the locale
    // (e.g. 'ar' instead of 'ar_IQ')
    const match = /[_-]/.exec(locale)
    if (!match) {
        return locale
    }

    const separator = match[0] // '-' or '_'
    const splitLocale = locale.split(separator)
    for (let i = splitLocale.length - 1; i > 0; i--) {
        const shorterLocale = splitLocale.slice(0, i).join(separator)
        if (i18n.hasResourceBundle(shorterLocale, I18N_NAMESPACE)) {
            return shorterLocale
        }
        console.log(`Translations for locale ${shorterLocale} not found`)
    }

    // if nothing else works, use the initially provided locale
    return locale
}

// Set locale for Moment and i18n
const setGlobalLocale = (locale) => {
    if (locale !== 'en' && locale !== 'en-us') {
        import(
            /* webpackChunkName: "moment-locales/[request]" */ `moment/locale/${locale}`
        ).catch(() => {
            /* ignore */
        })
    }
    moment.locale(locale)

    const resolvedLocale = validateLocaleByBundle(locale)
    i18n.changeLanguage(resolvedLocale)

    console.log('🗺 Global d2-i18n locale initialized:', resolvedLocale)
}

const getLocaleDirection = (locale) => {
    // for i18n.dir, need JS-formatted locale
    const jsLocale = locale.replace('_', '-')
    return i18n.dir(jsLocale)
}

// Sets the global direction based on the app's configured direction
// (which should be done to affect modals, alerts, and other portal elements).
// Note that the header bar will use the localeDirection regardless
const setGlobalDirection = ({ localeDirection, configDirection }) => {
    const globalDirection =
        configDirection === 'auto' ? localeDirection : configDirection
    document.documentElement.setAttribute('dir', globalDirection)
}

export const useLocale = ({ locale, configDirection }) => {
    const [result, setResult] = useState({})

    useEffect(() => {
        if (!locale) {
            return
        }

        setGlobalLocale(locale)

        const localeDirection = getLocaleDirection(locale)
        setGlobalDirection({ localeDirection, configDirection })

        setResult({ locale, direction: localeDirection })
    }, [locale, configDirection])

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
        locale:
            data &&
            (data.userSettings.keyUiLocale || window.navigator.language),
        configDirection,
    })

    if (error) {
        // This shouldn't happen, trigger the fatal error boundary
        throw new Error('Failed to fetch user locale: ' + error)
    }

    return { loading: loading || !locale, locale, direction }
}
