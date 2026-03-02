import i18n from '@dhis2/d2-i18n'
import moment from 'moment'

// Init i18n namespace
export const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

/**
 * userSettings.keyUiLocale is expected to be formatted by Java's
 * Locale.toString()... kind of: <language>[_<REGION>[_<Script>]]
 * https://github.com/dhis2/dhis2-core/pull/22819
 * https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#toString--
 * We can assume there are no Variants or Extensions to locales used by DHIS2
 *
 * Note: if a BCP 47 language tag-formatted locale is provided for the `locale`
 * argument, this function happens to work as well
 *
 * @param {string} locale
 * @returns Intl.Locale
 */
const parseDhis2Locale = (locale) => {
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

/**
 * @param {UserSettings} userSettings
 * @returns Intl.Locale
 */
export const parseLocale = (userSettings) => {
    try {
        // proposed property
        if (userSettings.keyUiLanguageTag) {
            return new Intl.Locale(userSettings.keyUiLanguageTag)
        }
        // legacy property
        if (userSettings.keyUiLocale) {
            return parseDhis2Locale(userSettings.keyUiLocale)
        }
    } catch (err) {
        console.error('Unable to parse locale from user settings:', {
            userSettings,
        })
    }

    // worst-case fallback
    return new Intl.Locale(window.navigator.language)
}

/**
 * @param {Intl.Locale} locale
 */
export const setI18nLocale = (locale) => {
    i18n.changeLanguage(locale?.baseName ?? 'en')
    console.log('🗺 Global d2-i18n locale initialized:', locale?.baseName)
}

/**
 * Moment locales use a hyphenated, lowercase format.
 * Since not all locales are included in Moment, this
 * function tries permutations of the locale to find one that's supported.
 * NB: None of them use both a region AND a script.
 * @param {Intl.Locale} locale
 */
export const setMomentLocale = async (locale) => {
    const { language, region, script } = locale

    if (locale.language === 'en' || locale.baseName === 'en-US') {
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
            // Since Vite prefers importing the ESM form of moment, we need
            // to import the ESM form of the locales here to use the same
            // moment instance
            await import(`moment/dist/locale/${localeName}`)
            moment.locale(localeName)
            break
        } catch {
            continue
        }
    }
}

/**
 * Sets the global direction based on the app's configured direction
 * (which should be done to affect modals, alerts, and other portal elements).
 * Defaults to 'ltr' if not set.
 * Note that the header bar will use the localeDirection regardless
 */
export const setDocumentDirection = ({ localeDirection, configDirection }) => {
    // validate config direction (also handles `undefined`)
    if (!['auto', 'ltr', 'rtl'].includes(configDirection)) {
        document.documentElement.setAttribute('dir', 'ltr')
        return
    }

    const globalDirection =
        configDirection === 'auto' ? localeDirection : configDirection
    document.documentElement.setAttribute('dir', globalDirection)
}
