import { useConfig, useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useState, useEffect, useMemo } from 'react'
import { useCustomTranslations } from './customTranslations.js'
import {
    setI18nLocale,
    parseLocale,
    setDocumentDirection,
    setMomentLocale,
} from './localeUtils.js'

const useLocale = ({
    userSettings,
    configDirection,
    customTranslationsInfo,
}) => {
    const { appUrlSlug } = useConfig()
    const getCustomTranslations = useCustomTranslations()
    const [result, setResult] = useState({
        locale: undefined,
        direction: undefined,
    })

    useEffect(() => {
        if (!userSettings) {
            return
        }

        const locale = parseLocale(userSettings)
        const dhis2Locale = userSettings.keyUiLocale

        let shouldFetchCustomTranslations = false
        if (customTranslationsInfo) {
            try {
                // In the `custom-translations/controller` data store key,
                // is there configured an object { [appUrlSlug]: dhis2Locale[] }
                // that includes the current dhis2Locale in the array?
                shouldFetchCustomTranslations =
                    customTranslationsInfo[appUrlSlug]?.includes(dhis2Locale)
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

        // Asynchronous - check datastore for custom translations if enabled
        const customTranslationsPromise = shouldFetchCustomTranslations
            ? getCustomTranslations({ locale, dhis2Locale })
            : Promise.resolve()

        // Synchronous -- will resolve before state is set and the child app is rendered
        setI18nLocale(locale)
        setMomentLocale(locale)

        // Intl.Locale dir utils aren't supported in firefox, so use i18n
        const localeDirection = i18n.dir(locale.language)
        setDocumentDirection({ localeDirection, configDirection })
        document.documentElement.setAttribute('lang', locale.baseName)

        customTranslationsPromise.then(() => {
            setResult({ locale, direction: localeDirection })
        })
    }, [
        userSettings,
        configDirection,
        getCustomTranslations,
        customTranslationsInfo,
        appUrlSlug,
    ])

    return result
}

// NOTE: This info would be nice to get from the Global Shell
const USER_SETTINGS_QUERY = {
    userSettings: {
        resource: 'userSettings',
    },
}
// For use in v43+
const CUSTOM_TRANSLATIONS_QUERY = {
    setting: {
        resource: 'systemSettings/keyCustomTranslationsEnabled',
    },
    // The values in this key are expected to be in the format
    // { [appUrlSlug]: dhis2LocaleCode[] }
    info: {
        resource: 'dataStore/custom-translations/controller',
    },
}
// note: userSettings.keyUiLocale is expected to be in the DHIS2 locale format,
// e.g. 'ar', 'ar_IQ', 'uz_UZ_Cyrl', etc.
export const useCurrentUserLocale = (configDirection) => {
    const { serverVersion } = useConfig()
    const customTranslationsAvailable = serverVersion.minor >= 43

    const { loading, error, data } = useDataQuery(USER_SETTINGS_QUERY)
    const customTranslationsQuery = useDataQuery(CUSTOM_TRANSLATIONS_QUERY, {
        // Below v43, don't run this query
        lazy: !customTranslationsAvailable,
        // If there's an error, it could be because the datastore isn't set up
        onError: () => console.log('Custom translations not available.'),
    })

    const customTranslationsInfo =
        customTranslationsAvailable &&
        customTranslationsQuery.data?.setting.keyCustomTranslationsEnabled &&
        customTranslationsQuery.data?.info

    const { locale, direction } = useLocale({
        userSettings: data && data.userSettings,
        customTranslationsInfo,
        configDirection,
    })

    if (error) {
        // This shouldn't happen, trigger the fatal error boundary
        throw new Error('Failed to fetch user locale: ' + error)
    }

    return {
        loading: loading || customTranslationsQuery.loading || !locale,
        locale,
        direction,
    }
}

const loginConfigQuery = {
    loginConfig: {
        resource: 'loginConfig',
    },
}

export const useSystemDefaultLocale = () => {
    // system language from loginConfiqQuery
    const { loading, data, error } = useDataQuery(loginConfigQuery)
    // set userSettings to use system locale by default
    const localeInformation = useMemo(
        () => ({
            userSettings: {
                keyUiLocale:
                    data &&
                    (data?.loginConfig?.uiLocale || window.navigator.language),
            },
            configDirection: 'auto',
        }),
        [data]
    )
    const locale = useLocale(localeInformation)
    if (error) {
        console.error(error)
    }
    return { loading: loading || !locale, locale }
}
