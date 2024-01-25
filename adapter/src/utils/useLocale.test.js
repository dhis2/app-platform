import i18n from '@dhis2/d2-i18n'
import { renderHook, act } from '@testing-library/react-hooks'
import moment from 'moment'
import { useLocale } from './useLocale.js'

// NOTE ABOUT MOCKS:
// Luckily, `await import(`moment/locale/${locale}`)` as used in
// `setMomentLocale` in `localeUtils.js` works the same in the Jest environment
// as in the real world, so it doesn't need mocking

jest.mock('@dhis2/d2-i18n', () => {
    return {
        setDefaultNamespace: jest.fn(),
        // These cases match translation files we have
        hasResourceBundle: jest.fn((localeString) => {
            switch (localeString) {
                case 'uz_UZ_Cyrl':
                case 'uz_UZ_Latn':
                case 'pt_BR':
                case 'ar':
                case 'en':
                    return true
                default:
                    return false
            }
        }),
        changeLanguage: jest.fn(),
        // rough approximation of behavior for locales used in this file:
        dir: jest.fn((localeString) =>
            localeString.startsWith('ar') ? 'rtl' : 'ltr'
        ),
    }
})

jest.mock('moment', () => ({
    locale: jest.fn(),
    defineLocale: jest.fn(),
}))

afterEach(() => {
    jest.clearAllMocks()
})

test('happy path initial load with en language', () => {
    const defaultUserSettings = { keyUiLocale: 'en' }
    const { result, rerender } = renderHook((newProps) => useLocale(newProps), {
        initialProps: defaultUserSettings,
    })

    expect(result.current.locale).toBe(undefined)
    expect(result.current.direction).toBe(undefined)

    act(() => {
        rerender({
            userSettings: defaultUserSettings,
            configDirection: undefined,
        })
    })

    expect(result.current.locale.baseName).toBe('en')
    expect(result.current.direction).toBe('ltr')
    expect(i18n.changeLanguage).toHaveBeenCalledWith('en')
    // this will only be valid on the first test:
    expect(i18n.setDefaultNamespace).toHaveBeenCalledWith('default')
    // moment.locale doesn't need to get called if the language is 'en'...
    // but it's asynchronous anyway. See following tests
    expect(moment.locale).not.toHaveBeenCalled()
})

describe('formerly problematic locales', () => {
    // For pt_BR (Portuguese in Brazil), before fixes:
    // 1. i18n.dir didn't work because it needs a BCP47-formatted string
    // 2. The Moment locale didn't work, because it uses another format
    test('pt_BR locale', async () => {
        const userSettings = { keyUiLocale: 'pt_BR' }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('ltr')
        // Notice different locale formats
        expect(result.current.locale.baseName).toBe('pt-BR')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('pt_BR')
        // Dynamic imports of Moment locales is asynchronous
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('pt-br')
        })
    })

    // For ar_EG (Arabic in Egypt), before fixes:
    // 1. i18n.dir didn't work because it needs a BCP47-formatted string
    // 2. Setting the i18next language didn't work because there are not translation
    // files for it (as of now, Jan 2024). This behavior is mocked above with
    // `i18n.hasResourceBundle()`
    // [Recent fixes allow for a fallback to simpler locales, e.g. 'ar',
    // for much better support]
    // 3. The Moment locale didn't work, both because of formatting and failing to
    // fall back to simpler locales
    test('ar_EG locale', async () => {
        const userSettings = { keyUiLocale: 'ar_EG' }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(result.current.locale.baseName).toBe('ar-EG')
        // Notice fallbacks
        expect(i18n.changeLanguage).toHaveBeenCalledWith('ar')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('ar')
        })
    })

    // for uz_UZ_Cyrl before fixes:
    // 1. i18n.dir didn't work because it needs a BCP47-formatted string
    // 2. Moment locales didn't work due to formatting and lack of fallback
    test('uz_UZ_Cyrl locale', async () => {
        const userSettings = { keyUiLocale: 'uz_UZ_Cyrl' }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('ltr')
        expect(result.current.locale.baseName).toBe('uz-Cyrl-UZ')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('uz_UZ_Cyrl')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('uz')
        })
    })
    // Similar for UZ Latin -- notice difference in the Moment locale
    test('uz_UZ_Latn locale', async () => {
        const userSettings = { keyUiLocale: 'uz_UZ_Latn' }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('ltr')
        expect(result.current.locale.baseName).toBe('uz-Latn-UZ')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('uz_UZ_Latn')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('uz-latn')
        })
    })
})

describe('other userSettings cases', () => {
    beforeEach(() => {
        // Mock browser language
        jest.spyOn(window.navigator, 'language', 'get').mockImplementation(
            () => 'ar-EG'
        )
    })

    test('proposed keyUiLanguageTag property is used (preferrentially)', async () => {
        const userSettings = {
            keyUiLocale: 'en',
            keyUiLanguageTag: 'pt-BR',
        }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('ltr')
        expect(result.current.locale.baseName).toBe('pt-BR')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('pt_BR')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('pt-br')
        })
    })

    test('keyUiLocale is missing from user settings for some reason (should fall back to browser language)', async () => {
        const userSettings = {}
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(result.current.locale.baseName).toBe('ar-EG')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('ar')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('ar')
        })
    })

    test('keyUiLocale is nonsense (should fall back to browser language)', async () => {
        const userSettings = { keyUiLocale: 'shouldCauseError' }
        const { result, waitFor } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(result.current.locale.baseName).toBe('ar-EG')
        expect(i18n.changeLanguage).toHaveBeenCalledWith('ar')
        await waitFor(() => {
            expect(moment.locale).toHaveBeenCalledWith('ar')
        })
    })
})

describe('config direction is respected for the document direction', () => {
    jest.spyOn(document.documentElement, 'setAttribute')

    test('ltr is the default and is used even for rtl languages', async () => {
        const userSettings = { keyUiLocale: 'ar' }
        const { result } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: undefined,
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
            'dir',
            'ltr'
        )
    })

    test('rtl will be used for the document if configured, even for an ltr language', () => {
        const userSettings = { keyUiLocale: 'en' }
        const { result } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: 'rtl',
            })
        )

        expect(result.current.direction).toBe('ltr')
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
            'dir',
            'rtl'
        )
    })

    test('if auto is used, document dir will match the language dir (ltr)', () => {
        const userSettings = { keyUiLocale: 'en' }
        const { result } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: 'auto',
            })
        )

        expect(result.current.direction).toBe('ltr')
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
            'dir',
            'ltr'
        )
    })

    test('if auto is used, document dir will match the language dir (ltr)', () => {
        const userSettings = { keyUiLocale: 'ar' }
        const { result } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: 'auto',
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
            'dir',
            'rtl'
        )
    })

    test('nonstandard config directions fall back to ltr', () => {
        const userSettings = { keyUiLocale: 'ar' }
        const { result } = renderHook(() =>
            useLocale({
                userSettings,
                configDirection: 'whoopslol',
            })
        )

        expect(result.current.direction).toBe('rtl')
        expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
            'dir',
            'ltr'
        )
    })
})

test('document `lang` attribute is set', () => {
    jest.spyOn(document.documentElement, 'setAttribute')
    const userSettings = { keyUiLocale: 'pt-BR' }

    renderHook(() =>
        useLocale({
            userSettings,
            configDirection: undefined,
        })
    )

    expect(document.documentElement.setAttribute).toHaveBeenCalledWith(
        'lang',
        'pt-BR'
    )
})
