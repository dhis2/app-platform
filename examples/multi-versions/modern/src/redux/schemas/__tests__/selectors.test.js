import { schemasDefaultState as defaultState } from '../reducer'
import {
    getSchemas,
    getSchemasData,
    getSchemasError,
    getSchemasLoaded,
    getSchemasLoading,
} from '../selectors'

describe('Selector', () => {
    const state = { schemas: defaultState }

    it('should get the schemas', () => {
        expect(getSchemas(state)).toEqual(defaultState)
    })

    it('should get the loading state', () => {
        expect(getSchemasLoading(state)).toEqual(defaultState.loading)
    })

    it('should get the loaded state', () => {
        expect(getSchemasLoaded(state)).toEqual(defaultState.loaded)
    })

    it('should get the error state', () => {
        expect(getSchemasError(state)).toEqual(defaultState.error)
    })

    it('should get the data state', () => {
        expect(getSchemasData(state)).toEqual(defaultState.data)
    })
})
