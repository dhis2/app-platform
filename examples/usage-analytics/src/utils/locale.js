import { setDocDir } from '@dhis2/ui/utils/rtl'
import i18n from '../locales'

export function setLocale(locale) {
    i18n.changeLanguage(locale)
    setDocDir(locale)
}
