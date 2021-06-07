import { useAlert } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import PropTypes from 'prop-types'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOfflineInterface } from './offline-interface.js'

const CachedSectionsContext = createContext()

/**
 * Uses the offline interface to access a Map of cached section IDs to their
 * last updated time. Provides that list, a 'removeSection(id)' function, and
 * an 'updateSections' function as context.
 */
export function CachedSectionsProvider({ children }) {
    const { show } = useAlert(
        ({ message }) => message,
        ({ props }) => ({ ...props })
    )
    const offlineInterface = useOfflineInterface()

    // cachedSections = Map: id => lastUpdated
    const [cachedSections, setCachedSections] = useState(new Map())

    // Get cached sections on load (and on other events?)
    useEffect(() => {
        updateSections()
    }, [])

    async function updateSections() {
        try {
            const list = await offlineInterface.getCachedSections()
            const map = new Map()
            list.forEach(section =>
                map.set(section.sectionId, section.lastUpdated)
            )
            setCachedSections(map)
        } catch (error) {
            const options = {
                message: i18n.t(
                    'There was an error when accessing cached sections. {{-msg}}',
                    { msg: error.message }
                ),
                props: { critical: true },
            }
            console.error(error)
            show(options)
        }
    }

    async function removeSection(id) {
        try {
            const success = await offlineInterface.removeSection(id)

            if (success) {
                const options = {
                    message: i18n.t('Section removed from offline storage.'),
                    props: { success: true },
                }
                show(options)
                updateSections()
            } else {
                const options = {
                    message: i18n.t(
                        'That section was not found in offline storage.'
                    ),
                }
                show(options)
                // No need to update sections here
            }

            return success
        } catch (error) {
            const options = {
                message: i18n.t(
                    'There was an error when trying to remove this section. {{-msg}}',
                    { msg: error.message }
                ),
                props: { critical: true },
            }
            console.error(error)
            show(options)
        }
    }

    const context = {
        cachedSections,
        removeSection,
        updateSections,
    }

    return (
        <CachedSectionsContext.Provider value={context}>
            {children}
        </CachedSectionsContext.Provider>
    )
}

CachedSectionsProvider.propTypes = {
    children: PropTypes.node,
}

/**
 * Access info and operations related to all cached sections.
 * @returns {Object} { cachedSections: Map, removeSection: func(id), updateSections: func() }
 */
export function useCachedSections() {
    const context = useContext(CachedSectionsContext)

    if (context === undefined) {
        throw new Error(
            'useCachedSections must be used within a CachedSectionsProvider'
        )
    }

    return context
}

/**
 * Accesses info and operations related to a single cached section.
 * @param {string} id - Section ID of a cached section
 * @returns {Object} { isCached: boolean, lastUpdated: Date, remove: func(), updateSections: func() }
 */
export function useCachedSection(id) {
    const context = useContext(CachedSectionsContext)

    if (context === undefined) {
        throw new Error(
            'useCachedSection must be used within a CachedSectionsProvider'
        )
    }

    const { cachedSections, removeSection, updateSections } = context

    const lastUpdated = cachedSections.get(id) // might be undefined
    const isCached = !!lastUpdated
    const remove = () => removeSection(id)

    return {
        isCached,
        lastUpdated,
        remove,
        updateSections,
    }
}
