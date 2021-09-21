import {
    loadingSchemasError,
    setSchemas,
    startLoadingSchemas,
} from '../actions'
import {
    schemas as reducer,
    schemasDefaultState as defaultState,
} from '../reducer'

const schemas = [
    {
        collectionName: 'organisationUnits',
        authorities: [
            {
                type: 'FOO',
                authorities: ['F_ORGANISATION_UNIT_FOO'],
            },
        ],
    },
]
const formattedSchemas = { organisationUnits: schemas[0] }

describe('Schemas reducer', () => {
    it('should return the state if an unknown action has been dispatched', () => {
        const state = { ...defaultState }
        const action = { type: 'UNKNOWN_ACTION' }
        const expected = defaultState
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the loaded state to true when it is false and a setSchemas action has been dispatched', () => {
        const state = { ...defaultState, loaded: false }
        const action = setSchemas(formattedSchemas)
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should not override the loaded state to true when it is true and schemas are being loaded again', () => {
        const state = { ...defaultState, loaded: true }
        const action = startLoadingSchemas()
        const expected = expect.objectContaining({ loaded: true })
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to true and error to null when starting to load schemas', () => {
        const state = {
            ...defaultState,
            loading: false,
            error: 'Previous error',
        }
        const action = startLoadingSchemas()
        const expected = { ...state, loading: true, error: null }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set loading to false and override the data when a setSchemas action has been dispatched', () => {
        const state = {
            ...defaultState,
            loaded: true,
            loading: true,
            data: null,
        }
        const action = setSchemas(formattedSchemas)
        const expected = { ...state, loading: false, data: formattedSchemas }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })

    it('should set the error and loading to false when a load schemas error action is dispatched', () => {
        const error = 'An error occureed'
        const state = { ...defaultState, loading: true, error: null }
        const action = loadingSchemasError(error)
        const expected = { ...state, loading: false, error }
        const actual = reducer(state, action)

        expect(actual).toEqual(expected)
    })
})
