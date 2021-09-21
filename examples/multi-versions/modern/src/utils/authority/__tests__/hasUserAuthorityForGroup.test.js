import { groups } from '../../../config'
import { hasUserAuthorityForGroup } from '../hasUserAuthorityForGroup'

describe('hasUserAuthorityForGroup', () => {
    const noAuth = false
    const group = groups.organisationUnit
    const systemSettings = { keyRequireAddToView: true }
    const schemas = {
        organisationUnits: {
            authorities: [
                {
                    type: 'FOO',
                    authorities: ['F_ORGANISATION_UNIT_FOO'],
                },
            ],
        },
        organisationUnitGroups: {
            authorities: [
                {
                    type: 'FOO',
                    authorities: ['F_ORGANISATION_UNIT_GROUP_FOO'],
                },
            ],
        },
        organisationUnitGroupSets: {
            authorities: [
                {
                    type: 'FOO',
                    authorities: ['F_ORGANISATION_UNIT_GROUP_SET_FOO'],
                },
            ],
        },
        organisationUnitLevels: {
            authorities: [
                {
                    type: 'FOO',
                    authorities: ['F_ORGANISATION_UNIT_LEVEL_FOO'],
                },
            ],
        },
    }

    it('should return true when noAuth is true', () => {
        const userAuthorities = []
        const hasAuthority = hasUserAuthorityForGroup({
            group,
            schemas,
            systemSettings,
            userAuthorities,
            noAuth: true,
        })

        expect(hasAuthority).toBe(true)
    })

    it('should return true when systemSettings.keyRequireAddToView is false', () => {
        const userAuthorities = []
        const hasAuthority = hasUserAuthorityForGroup({
            group,
            schemas,
            systemSettings: { keyRequireAddToView: false },
            userAuthorities,
            noAuth,
        })

        expect(hasAuthority).toBe(true)
    })

    it('should return true user has required authorities', () => {
        const userAuthorities = ['F_ORGANISATION_UNIT_FOO']
        const hasAuthority = hasUserAuthorityForGroup({
            group,
            schemas,
            systemSettings,
            userAuthorities,
            noAuth,
        })

        expect(hasAuthority).toBe(true)
    })

    it('should return false user does not have required authorities', () => {
        const userAuthorities = ['F_ORGANISATION_UNIT_BAR']
        const hasAuthority = hasUserAuthorityForGroup({
            group,
            schemas,
            systemSettings,
            userAuthorities,
            noAuth,
        })

        expect(hasAuthority).toBe(false)
    })
})
