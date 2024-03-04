import i18n from '@dhis2/d2-i18n'
import moment from 'moment'

// Init i18n namespace
const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

/**
 * userSettings.keyUiLocale is expected to be formatted by Java's
 * Locale.toString():
 * https://docs.oracle.com/javase/8/docs/api/java/util/Locale.html#toString--
 * We can assume there are no Variants or Extensions to locales used by DHIS2
 * @param {Intl.Locale} locale
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
            return parseJavaLocale(userSettings.keyUiLocale)
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
 * Test locales for available translation files -- if they're not found,
 * try less-specific versions.
 * Both "Java Locale.toString()" and BCP 47 language tag formats are tested
 * @param {Intl.Locale} locale
 */
export const setI18nLocale = (locale) => {
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
