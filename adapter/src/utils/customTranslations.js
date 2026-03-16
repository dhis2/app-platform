import { useConfig, useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useCallback } from 'react'
import { I18N_NAMESPACE } from './localeUtils'

const customTranslationsQuery = {
    customTranslations: {
        resource: 'dataStore/custom-translations',
        id: ({ appUrlSlug, dhis2Locale }) => `${appUrlSlug}__${dhis2Locale}`,
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
    const engine = useDataEngine()

    /**
     * Checks contents of the "controller" key of the datastore.
     * If it's empty, malformatted, or doesn't contain the combination of
     * this app + current locale, don't look for custom translations
     */
    const getShouldFetchCustomTranslations = useCallback(
        ({ dhis2Locale, customTranslationsInfo }) => {
            let shouldFetchCustomTranslations = false
            if (customTranslationsInfo) {
                try {
                    // In the `custom-translations/controller` data store key,
                    // is there configured an object { [appUrlSlug]: dhis2Locale[] }
                    // that includes the current dhis2Locale in the array?
                    shouldFetchCustomTranslations =
                        customTranslationsInfo[appUrlSlug]?.includes(
                            dhis2Locale
                        )
                    if (!shouldFetchCustomTranslations) {
                        console.debug(
                            'Custom translations not found in controller for this app and locale.'
                        )
                    }
                } catch (err) {
                    console.error('Error parsing custom translation controller')
                    console.error(err)
                }
            }
            return shouldFetchCustomTranslations
        },
        [appUrlSlug]
    )

    const getCustomTranslations = useCallback(
        /**
         * If relevant, checks the datastore for custom translations
         * and loads them if found
         * @param {Object} params
         * @param {Intl.Locale} params.locale - The parsed locale in BCP47 format
         * @param {string} params.dhis2Locale - The locale in DHIS2 format
         * @param {Object} params.customTranslationsInfo - The contents of the "controller" key
         */
        async ({ locale, dhis2Locale, customTranslationsInfo }) => {
            if (
                !dhis2Locale ||
                !locale.baseName ||
                !getShouldFetchCustomTranslations({
                    dhis2Locale,
                    customTranslationsInfo,
                })
            ) {
                return
            }

            try {
                const data = await engine.query(customTranslationsQuery, {
                    variables: { appUrlSlug, dhis2Locale },
                })
                i18n.addResourceBundle(
                    locale?.baseName,
                    I18N_NAMESPACE,
                    data.customTranslations,
                    true, // 'deep' -- add keys in this bundle to existing translations
                    true // 'overwrite' -- overwrite already existing keys
                )
            } catch {
                console.warn(
                    `No custom translations found in the datastore for this app and locale (looked for the key ${appUrlSlug}__${dhis2Locale} in the custom-translations namespace)`
                )
            }
        },
        [engine, appUrlSlug, getShouldFetchCustomTranslations]
    )

    return getCustomTranslations
}
