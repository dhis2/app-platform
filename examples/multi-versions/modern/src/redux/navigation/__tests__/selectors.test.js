import { navigationDefaultState as defaultState } from '../reducer'
import { getNavigation, getNavigationDisabled } from '../selectors'

describe('Selector', () => {
    const state = { navigation: defaultState }

    it('should return the navigation', () => {
        expect(getNavigation(state)).toEqual(defaultState)
    })

    it('should return the disabled state', () => {
        expect(getNavigationDisabled(state)).toBe(defaultState.disabled)
    })
})
