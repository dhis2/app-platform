import {
    dataSetSections,
    organisationUnitSections,
} from '../../../config/sections'
import { hasUserAuthorityForSection } from '../hasUserAuthorityForSection'

describe('hasUserAuthorityForSection', () => {
    let section
    const systemSettings = { keyRequireAddToView: true }
    const schemas = {
        dataSets: {
            authorities: [
                {
                    type: 'FOO',
                    authorities: ['F_DATA_SET_FOO'],
                },
            ],
        },
    }

    beforeEach(() => {
        section = dataSetSections.dataSet
    })

    it('should return true when the user has the required authorities', () => {
        const userAuthorities = ['F_DATA_SET_FOO']
        const hasAuthority = hasUserAuthorityForSection({
            section,
            schemas,
            systemSettings,
            userAuthorities,
        })

        expect(hasAuthority).toBe(true)
    })

    it('should return true when the user has the required static authorities', () => {
        section = organisationUnitSections.hierarchyOperations

        const userAuthorities = ['F_ORGANISATIONUNIT_MOVE']
        const hasAuthority = hasUserAuthorityForSection({
            section,
            schemas,
            systemSettings,
            userAuthorities,
        })

        expect(hasAuthority).toBe(true)
    })

    it('should return false when the user does not have the required authorities', () => {
        const userAuthorities = ['F_DATA_SET_BAR']
        const hasAuthority = hasUserAuthorityForSection({
            section,
            schemas,
            systemSettings,
            userAuthorities,
        })

        expect(hasAuthority).toBe(false)
    })

    it('should return false when the user does not have the required static authorities', () => {
        section = organisationUnitSections.hierarchyOperations

        const userAuthorities = ['F_ORGANISATIONUNIT_LIFT']
        const hasAuthority = hasUserAuthorityForSection({
            section,
            schemas,
            systemSettings,
            userAuthorities,
        })

        expect(hasAuthority).toBe(false)
    })
})
