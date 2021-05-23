import PropTypes from 'prop-types'
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useOfflineInterface } from './offline-interface.js'

const CachedSectionsContext = createContext()

// Current implementation not optimized because it only 'getsCachedSections' on mount; could be done before?
export function CachedSectionsProvider({ children }) {
    const offlineInterface = useOfflineInterface()

    // cachedSections = Map: id => lastUpdated
    const [cachedSections, setCachedSections] = useState(new Map())

    // Get cached sections on load (and on other events?)
    useEffect(() => {
        updateSections()
    }, [])

    async function updateSections() {
        const list = await offlineInterface.getCachedSections()
        const map = new Map()
        list.forEach(section => map.set(section.sectionId, section.lastUpdated))
        setCachedSections(map)
    }

    const value = {
        cachedSections,
        // TODO: Feedback; handle nonexistent ID?
        removeSection: async id => {
            await offlineInterface.removeSection(id)
            updateSections()
        },
        updateSections,
    }

    return (
        <CachedSectionsContext.Provider value={value}>
            {children}
        </CachedSectionsContext.Provider>
    )
}

CachedSectionsProvider.propTypes = {
    children: PropTypes.node,
}

// TODO: Consider taking an optional 'id' param to return values for a single section,
// or make a separate a separate 'useCachedSection(id)' hook to access that.
export function useCachedSections() {
    const values = useContext(CachedSectionsContext)

    if (values === undefined) {
        throw new Error(
            'useCachedSections must be used within a CachedSectionsProvider'
        )
    }

    return values
}
