import {
    getUserAuthorities,
    getUserAuthoritiesLoading,
    getUserAuthoritiesLoaded,
    getUserAuthoritiesError,
    getUserAuthoritiesData,
} from '../selectors'
import { userAuthoritiesDefaultState as defaultState } from '../reducer'

describe('Selectors', () => {
    const state = { userAuthorities: defaultState }

    it('should get the userAuthorities', () => {
        expect(getUserAuthorities(state)).toEqual(defaultState)
    })

    it('should get the loading state', () => {
        expect(getUserAuthoritiesLoading(state)).toEqual(defaultState.loading)
    })

    it('should get the loaded state', () => {
        expect(getUserAuthoritiesLoaded(state)).toEqual(defaultState.loaded)
    })

    it('should get the error state', () => {
        expect(getUserAuthoritiesError(state)).toEqual(defaultState.error)
    })

    it('should get the data state', () => {
        expect(getUserAuthoritiesData(state)).toEqual(defaultState.data)
    })
})
