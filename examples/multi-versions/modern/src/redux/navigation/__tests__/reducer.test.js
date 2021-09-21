import { disableNavigation, enableNavigation } from '../actions'
import {
    navigationDefaultState as defaultState,
    navigation as reducer,
} from '../reducer'

describe('Reducer', () => {
    it('should return the current state if an unknown action has been dispatched', () => {
        const state = { ...defaultState }
        const action = { type: 'UNKNOWN_ACTION' }
        const expected = defaultState
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the disabled state to true when disable action has been dispatched', () => {
        const state = { ...defaultState, disabled: false }
        const action = disableNavigation()
        const expected = { ...state, disabled: true }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the disabled state to false when enable action has been dispatched', () => {
        const state = { ...defaultState, disabled: true }
        const action = enableNavigation()
        const expected = { ...state, disabled: false }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })
})
