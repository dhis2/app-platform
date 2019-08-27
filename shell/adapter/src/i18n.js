import React, { useEffect } from 'react'
import i18n from '@dhis2/d2-i18ns'

export const addResources = (namespace, translations) => {
    Object.entries(translations).forEach(([language, translationStrings]) => {
        i18n.addResources(language, namespace, translationStrings)
        import(`moment/locale/${language}`)
    })
}

export const useInternationalization = defaultNamespace => {
    useEffect(() => {
        moment.locale('fr')
        i18n.changeLanguage('fr')

        if (defaultNamespace) {
            i18n.setDefaultNamespace(defaultNamespace)
        }
    })
}
