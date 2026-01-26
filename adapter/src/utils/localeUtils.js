import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'
import { useCallback } from 'react'

// Init i18n namespace
const I18N_NAMESPACE = 'default'
i18n.setDefaultNamespace(I18N_NAMESPACE)

const customTranslationsQuery = {
    customTranslations: {
        resource: 'dataStore/custom-translations',
        id: ({ appUrlSlug, dhis2Locale }) => `${appUrlSlug}--${dhis2Locale}`,
    },
}
/**
 * Returns a function to look for custom translations for this app and locale
 * in the datastore, using a key convention with the app name and user locale
 * in the 'custom-translations' namespace.
 * If the translations exist, they will be added to the translation bundle for
 * the user's locale. This search will run asynchronously and is not awaited,
 * but it will usually resolve before the app's main translation bundles are
 * added, so steps are taken to make sure the custom translations take priority
 * over (and don't get overwritten by) the main app translations
 */
export const useCustomTranslations = () => {
    const { appUrlSlug } = useConfig()
    const { refetch } = useDataQuery(customTranslationsQuery, {
        lazy: true,
        // dhis2locale should be sent as a variable at query time
        variables: { appUrlSlug },
    })

    const getCustomTranslations = useCallback(
        /**
         * Checks the datastore for custom translations and loads them if found
         * @param {Object} params
         * @param {Intl.Locale} params.locale - The parsed locale in BCP47 format
         * @param {string} params.dhis2Locale - The locale in DHIS2 format
         */
        async ({ locale, dhis2Locale }) => {
            if (!dhis2Locale) {
                return
            }
            try {
                const data = await refetch({ dhis2Locale })
                i18n.addResourceBundle(
                    locale?.baseName ?? 'en',
                    I18N_NAMESPACE,
                    data.customTranslations,
                    true, // 'deep' -- add keys in this bundle to existing translations
                    true // 'overwrite' -- overwrite already existing keys
                )
            } catch {
                console.log(
                    `No custom translations found in the datastore for this app and locale (looked for the key ${appUrlSlug}--${dhis2Locale} in the custom-translations namespace)`
                )
            }
        },
        [refetch, appUrlSlug]
    )

    return getCustomTranslations
}

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
