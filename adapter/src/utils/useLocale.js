import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useState, useEffect } from 'react'

const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

// Test locales for available translation files -- if they're not found,
// try less-specific versions.
// Both "Java Locale.toString()" and BCP 47 language tag formats are tested
const setI18nLocale = (locale) => {
    const { language, script, region } = locale

    const localeStringOptions = []
    if (script && region) {
        localeStringOptions.push(
            `${language}_${region}_${script}`,
            `${language}-${script}-${region}` // NB: different order
        )
    }
    if (region) {
        localeStringOptions.push(
            `${language}_${region}`,
            `${language}-${region}`
        )
    }
    if (script) {
        localeStringOptions.push(
            `${language}_${script}`,
            `${language}-${script}`
        )
    }
    localeStringOptions.push(language)

    let localeStringWithTranslations
    const unsuccessfulLocaleStrings = []
    for (const localeString of localeStringOptions) {
        if (i18n.hasResourceBundle(localeString, I18N_NAMESPACE)) {
            localeStringWithTranslations = localeString
            break
        }
        unsuccessfulLocaleStrings.push(localeString)
        // even though the localeString === language will be the default below,
        // it still tested here to provide feedback if translation files
        // are not found
    }

    if (unsuccessfulLocaleStrings.length > 0) {
        console.log(
            `Translations for locale(s) ${unsuccessfulLocaleStrings.join(
                ', '
            )} not found`
        )
    }

    // if no translation files are found, still try to fall back to `language`
    const finalLocaleString = localeStringWithTranslations || language
    i18n.changeLanguage(finalLocaleString)
    console.log('🗺 Global d2-i18n locale initialized:', finalLocaleString)
}

// Moment locales use a hyphenated, lowercase format.
// Since not all locales are included in Moment, this
// function tries permutations of the locale to find one that's supported.
// NB: None of them use both a region AND a script.
const setMomentLocale = async (locale) => {
    const { language, region, script } = locale

    if (locale.language === 'en' && locale.region === 'US') {
        return // this is Moment's default locale
    }

    const localeNameOptions = []
    if (script) {
        localeNameOptions.push(`${language}-${script}`.toLowerCase())
    }
    if (region) {
        localeNameOptions.push(`${language}-${region}`.toLowerCase())
    }
    localeNameOptions.push(language)

    for (const localeName of localeNameOptions) {
        try {
            await import(
                /* webpackChunkName: "moment-locales/[request]" */ `moment/locale/${localeName}`
            )
            moment.locale(localeName)
            break
        } catch {
            continue
        }
    }
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

        setI18nLocale(locale)
        setMomentLocale(locale)

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
