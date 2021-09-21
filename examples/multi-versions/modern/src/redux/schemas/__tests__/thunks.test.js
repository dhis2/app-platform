jest.mock('../../configureStore')

import { configureStore } from '../../configureStore'
import { loadSchemas } from '../thunks'
import {
    loadingSchemasError,
    setSchemas,
    startLoadingSchemas,
} from '../actions'

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

describe('loadSchemas', () => {
    const engine = {
        query: jest.fn(() => Promise.resolve({ schemas: { schemas } })),
    }
    const store = configureStore(engine)

    beforeEach(() => {
        store.clearActions()
    })

    afterEach(() => {
        engine.query.mockClear()
    })

    it('should dispatch a loading schemas start action', done => {
        const expectedActions = expect.arrayContaining([startLoadingSchemas()])

        store.dispatch(loadSchemas()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a set schemas action when done loading', done => {
        const expectedActions = expect.arrayContaining([
            setSchemas(formattedSchemas),
        ])

        store.dispatch(loadSchemas()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })

    it('should dispatch a loading schemas error action when an error occurred', done => {
        const error = 'An error occurred'
        engine.query.mockImplementationOnce(() =>
            Promise.reject(new Error(error))
        )
        const expectedActions = expect.arrayContaining([
            loadingSchemasError(error),
        ])

        store.dispatch(loadSchemas()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
            done()
        })
    })
})
