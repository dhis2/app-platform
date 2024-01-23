import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useState, useEffect } from 'react'

const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

// if translation resources aren't found for the given locale, try shorter
// versions of the locale
// e.g. 'pt_BR_Cyrl_asdf' => 'pt_BR', or 'ar-NotFound' => 'ar'
const getResolvedLocale = (locale) => {
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
    const localeString = locale.baseName
    console.log({ locale, localeString })

    // todo: try/catch here to try different arrangements
    if (locale.language !== 'en' && locale.region !== 'US') {
        import(
            /* webpackChunkName: "moment-locales/[request]" */ `moment/locale/${localeString}`
        ).catch(() => {
            /* ignore */
        })
    }
    moment.locale(localeString)

    const resolvedLocale = getResolvedLocale(localeString)
    i18n.changeLanguage(resolvedLocale)

    console.log('🗺 Global d2-i18n locale initialized:', resolvedLocale)
}

// Sets the global direction based on the app's configured direction
// (which should be done to affect modals, alerts, and other portal elements).
// Defaults to 'ltr' if not set.
// Note that the header bar will use the localeDirection regardless
const setGlobalDirection = ({ localeDirection, configDirection }) => {
    const globalDirection =
        configDirection === 'auto' ? localeDirection : configDirection || 'ltr'
    document.documentElement.setAttribute('dir', globalDirection)
}

/**
 * userSettings.keyUiLocale is expected to be formatted by Java's
 * Locale.toString():
 * https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#toString--
 * We can assume there are no Variants or Extensions to locales used by DHIS2
 */
const parseJavaLocale = (locale) => {
    const [language, region, script] = locale.split('_')

    let languageTag = language
    if (script) {
        languageTag += `-${script}`
    }
    if (region) {
        languageTag += `-${region}`
    }

    console.log({ locale, language, script, region, languageTag })
    return new Intl.Locale(languageTag)
}

/** Returns a JS Intl.Locale object */
const parseLocale = (userSettings) => {
    // new property
    if (userSettings.keyUiLanguageTag) {
        return new Intl.Locale(userSettings.keyUiLanguageTag)
    }
    // legacy property
    if (userSettings.keyUiLocale) {
        return parseJavaLocale(userSettings.keyUiLocale)
    }

    // worst-case fallback
    return new Intl.Locale(window.navigator.language)
}

export const useLocale = ({ userSettings, configDirection }) => {
    const [result, setResult] = useState({
        locale: undefined,
        direction: undefined,
    })

    useEffect(() => {
        if (!userSettings) {
            return
        }

        const locale = parseLocale(userSettings)

        setGlobalLocale(locale)
        // setI18nLocale(locale)
        // setMomentLocale(locale)

        // Intl.Locale dir utils aren't supported in firefox, so use i18n
        const localeDirection = i18n.dir(locale.language)
        setGlobalDirection({ localeDirection, configDirection })

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
