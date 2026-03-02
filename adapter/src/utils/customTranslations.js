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
                const data = await engine.query(customTranslationsQuery, {
                    variables: { appUrlSlug, dhis2Locale },
                })
                i18n.addResourceBundle(
                    locale?.baseName ?? 'en',
                    I18N_NAMESPACE,
                    data.customTranslations,
                    true, // 'deep' -- add keys in this bundle to existing translations
                    true // 'overwrite' -- overwrite already existing keys
                )
            } catch {
                console.warning(
                    `No custom translations found in the datastore for this app and locale (looked for the key ${appUrlSlug}__${dhis2Locale} in the custom-translations namespace)`
                )
            }
        },
        [engine, appUrlSlug]
    )

    return getCustomTranslations
}
