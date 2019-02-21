import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as api from '../api'
import {
    initApp,
    updateCategory,
    updateFilterAndGetData,
    updateFilter,
    updateUsageData,
    isNewDataRequiredAfterCategoryChange,
} from './index'
import * as TYPES from './types'
import {
    FAVORITE_VIEWS,
    FAVORITES_SAVED,
    TOP_FAVORITES,
} from '../constants/categories'

const mockStore = configureMockStore([thunk])
const DEFAULT_STORE_STATE = {
    filter: {
        category: FAVORITE_VIEWS,
    },
    usageData: [],
}

const mockResponse = { data: 'test' }
const mockError = { message: 'Oops' }
const mockResolvingPromise = jest.fn(() => Promise.resolve(mockResponse))
const mockRejectingPromise = jest.fn(() => Promise.reject(mockError))

const CATEGORY = 'category'

const MOCK_ACTIONS = {
    [TYPES.FILTER_UPDATED]: {
        type: TYPES.FILTER_UPDATED,
        payload: {
            key: CATEGORY,
            value: TOP_FAVORITES,
        },
    },
    [TYPES.APP_LOAD_SUCCESS]: {
        type: TYPES.APP_LOAD_SUCCESS,
        payload: mockResponse,
    },
    [TYPES.APP_LOAD_ERROR]: {
        type: TYPES.APP_LOAD_ERROR,
        payload: mockError,
    },
    [TYPES.USAGE_DATA_REQUESTED]: {
        type: TYPES.USAGE_DATA_REQUESTED,
        payload: undefined,
    },
    [TYPES.USAGE_DATA_RECEIVED]: {
        type: TYPES.USAGE_DATA_RECEIVED,
        payload: mockResponse,
    },
    [TYPES.USAGE_DATA_ERRORED]: {
        type: TYPES.USAGE_DATA_ERRORED,
        payload: mockError,
    },
}

afterAll(() => {
    jest.resetAllMocks()
})

describe('updateFilter', () => {
    it('should create an action to update the filter', () => {
        expect(updateFilter(CATEGORY, TOP_FAVORITES)).toEqual(
            MOCK_ACTIONS[TYPES.FILTER_UPDATED]
        )
    })
})

describe('initApp', () => {
    it('creates APP_LOAD_SUCCESS when initApp resolves successfully', () => {
        // mock api method
        api.initApp = mockResolvingPromise
        const expectedActions = [MOCK_ACTIONS[TYPES.APP_LOAD_SUCCESS]]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store.dispatch(initApp()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })
    it('creates APP_LOAD_ERROR when initApp is rejected', () => {
        // mock api method
        api.initApp = mockRejectingPromise
        const expectedActions = [MOCK_ACTIONS[TYPES.APP_LOAD_ERROR]]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store.dispatch(initApp()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })
})

describe('updateCategory', () => {
    it('creates USAGE_DATA_RECEIVED when new data is required and getUsageData resolves successfully', () => {
        api.getUsageData = mockResolvingPromise
        const expectedActions = [
            MOCK_ACTIONS[TYPES.FILTER_UPDATED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_REQUESTED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_RECEIVED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store
            .dispatch(updateCategory(CATEGORY, TOP_FAVORITES))
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
    })
    it('creates USAGE_DATA_ERRORED when new data is required and getUsageData is rejected', () => {
        api.getUsageData = mockRejectingPromise
        const expectedActions = [
            MOCK_ACTIONS[TYPES.FILTER_UPDATED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_REQUESTED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_ERRORED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store
            .dispatch(updateCategory(CATEGORY, TOP_FAVORITES))
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
    })
    it('creates FILTER_UPDATED when new data is NOT required', () => {
        const updateAction = {
            ...MOCK_ACTIONS[TYPES.FILTER_UPDATED],
            payload: {
                ...MOCK_ACTIONS[TYPES.FILTER_UPDATED].payload,
                value: FAVORITES_SAVED,
            },
        }
        const expectedActions = [updateAction]
        const store = mockStore(DEFAULT_STORE_STATE)
        store.dispatch(updateCategory(CATEGORY, FAVORITES_SAVED))
        expect(store.getActions()).toEqual(expectedActions)
    })
})

describe('updateFilterAndGetData', () => {
    const BASE_ACTIONS = [
        MOCK_ACTIONS[TYPES.FILTER_UPDATED],
        MOCK_ACTIONS[TYPES.USAGE_DATA_REQUESTED],
    ]

    it('creates USAGE_DATA_RECEIVED when updateFilterAndGetData resolves successfully', () => {
        // mock api method
        api.getUsageData = mockResolvingPromise
        const expectedActions = [
            ...BASE_ACTIONS,
            MOCK_ACTIONS[TYPES.USAGE_DATA_RECEIVED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store
            .dispatch(updateFilterAndGetData(CATEGORY, TOP_FAVORITES))
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
    })
    it('creates USAGE_DATA_ERRORED when updateFilterAndGetData is rejected', () => {
        // mock api method
        api.getUsageData = mockRejectingPromise
        const expectedActions = [
            ...BASE_ACTIONS,
            MOCK_ACTIONS[TYPES.USAGE_DATA_ERRORED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store
            .dispatch(updateFilterAndGetData(CATEGORY, TOP_FAVORITES))
            .then(() => {
                expect(store.getActions()).toEqual(expectedActions)
            })
    })
})

describe('updateUsageData', () => {
    it('creates USAGE_DATA_RECEIVED when getUsageData resolves successfully', () => {
        api.getUsageData = mockResolvingPromise
        const expectedActions = [
            MOCK_ACTIONS[TYPES.USAGE_DATA_REQUESTED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_RECEIVED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store.dispatch(updateUsageData()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })
    it('creates USAGE_DATA_ERRORED when getUsageData is rejected', () => {
        api.getUsageData = mockRejectingPromise
        const expectedActions = [
            MOCK_ACTIONS[TYPES.USAGE_DATA_REQUESTED],
            MOCK_ACTIONS[TYPES.USAGE_DATA_ERRORED],
        ]
        const store = mockStore(DEFAULT_STORE_STATE)
        return store.dispatch(updateUsageData()).then(() => {
            expect(store.getActions()).toEqual(expectedActions)
        })
    })
})

describe('isNewDataRequiredAfterCategoryChange', () => {
    it('returns true when switching from another category to TOP_FAVORITES', () => {
        expect(
            isNewDataRequiredAfterCategoryChange(FAVORITE_VIEWS, TOP_FAVORITES)
        ).toEqual(true)
    })
    it('returns false when switching category and both are not TOP_FAVORITES', () => {
        expect(
            isNewDataRequiredAfterCategoryChange(
                FAVORITE_VIEWS,
                FAVORITES_SAVED
            )
        ).toEqual(false)
    })
    it('returns true when switching from TOP_FAVORITES to another', () => {
        expect(
            isNewDataRequiredAfterCategoryChange(TOP_FAVORITES, FAVORITES_SAVED)
        ).toEqual(true)
    })
})
