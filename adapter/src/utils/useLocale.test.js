import { renderHook /*, act */ } from '@testing-library/react-hooks'
import { useLocale } from './useLocale.js'

jest.mock('@dhis2/d2-i18n', () => ({
    setDefaultNamespace: (namespace) => console.log({ namespace }),
    hasResourceBundle: (bundleName) => {
        console.log({ bundleName })
        return true // todo
    },
    dir: (localeString) => {
        console.log({ localeString })
        // rough approximation of function
        return localeString.startsWith('ar') ? 'rtl' : 'ltr'
    },
    changeLanguage: (langArg) => console.log({ langArg }),
}))

jest.mock('moment', () => ({
    locale: (momentLocale) => console.log({ momentLocale }),
}))

const defaultUserSettings = { keyUiLocale: 'en' }

test('it renders', async () => {
    const { result } = renderHook(() =>
        useLocale({
            userSettings: defaultUserSettings,
            configDirection: undefined,
        })
    )

    console.log('current result', result.current)

    expect(result.current.locale.baseName).toBe('en')
    expect(result.current.direction).toBe('ltr')
})

// TODO Tests
// Test undefined userSettings - todo'd
// Test undefined userSettings.keyUiLocale - todo'd
// Test undefined locale
// Test nonsense locale -- todo'd
// Test Java locale
// Test BCP 47 locale on keyUiLanguageTag
// Test ar_EG locale (before: had no translations)
// Test pt_BR
// Make sure directions are correct
// Make sure moment locale is correct
// Make sure i18n locale either has translations or is reasonable
// ^ (should it be 'en'? wondering about maintanance_tl_keys)

// TODO Mocks
// i18n.dir
// i18n.hasResourceBundle(name, namespace)
// moment.locale()
// import ('moment/locales/${localeString})

describe('basic edge case handling', () => {
    test('it handles undefined userSettings', () => {
        // todo
    })

    test.todo('it handles undefined userSettings.keyUiLocale')

    test.todo('it handles nonsense locales')
})

// describe('language test cases')
