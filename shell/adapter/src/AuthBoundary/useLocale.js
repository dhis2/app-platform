import { useEffect } from 'react'
import i18n from '@dhis2/d2-i18n'
import moment from 'moment'

i18n.setDefaultNamespace('default')

const simplifyLocale = locale => {
    const idx = locale.indexOf('-')
    if (idx === -1) {
        return locale
    }
    return locale.substr(0, idx)
}

let globalLocale = null
function changeLanguage(locale) {
    globalLocale = locale
    const simplifiedLocale = simplifyLocale(locale)
    if (simplifiedLocale !== i18n.language) {
        i18n.off('languageChanged', blockLocaleUpdate)
        i18n.changeLanguage(simplifiedLocale)
        i18n.on('languageChanged', blockLocaleUpdate)
    }
}
function blockLocaleUpdate() {
    // CHANGE IT BACK!
    if (globalLocale) {
        changeLanguage(globalLocale)
    }
}

const setGlobalLocale = locale => {
    if (locale !== 'en' && locale !== 'en-us') {
        import(`moment/locale/${locale}`).catch(() => {
            /* ignore */
        })
    }
    moment.locale(locale)
    changeLanguage(locale)
}

export const useLocale = locale => {
    useEffect(() => {
        const init = () => setGlobalLocale(locale || window.navigator.language)
        if (i18n.isInitialized) {
            init()
        } else {
            i18n.on('initialized', init)
            return () => {
                i18n.off('initialized', init)
            }
        }
    }, [locale])
}
