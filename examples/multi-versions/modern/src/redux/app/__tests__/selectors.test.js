import { getAppReady } from '../selectors'

describe('Selectors', () => {
    let state
    const appReadyState = {
        schemas: { loading: false, loaded: true },
        systemSettings: { loading: false, loaded: true },
        userAuthorities: { loading: false, loaded: true },
    }

    it('should return that app is ready when conditions are met', () => {
        expect(getAppReady(appReadyState)).toBe(true)
    })

    it('should return that app is not ready when schemas are loading', () => {
        state = {
            ...appReadyState,
            schemas: {
                ...appReadyState.schemas,
                loading: true,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })

    it('should return that app is not ready when schemas are not loaded', () => {
        state = {
            ...appReadyState,
            schemas: {
                ...appReadyState.schemas,
                loaded: false,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })

    it('should return that app is not ready when systemSettings are loading', () => {
        state = {
            ...appReadyState,
            systemSettings: {
                ...appReadyState.systemSettings,
                loading: true,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })

    it('should return that app is not ready when systemSettings are not loaded', () => {
        state = {
            ...appReadyState,
            systemSettings: {
                ...appReadyState.systemSettings,
                loaded: false,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })

    it('should return that app is not ready when userAuthorities are loading', () => {
        state = {
            ...appReadyState,
            userAuthorities: {
                ...appReadyState.userAuthorities,
                loading: true,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })

    it('should return that app is not ready when userAuthorities are not loaded', () => {
        state = {
            ...appReadyState,
            userAuthorities: {
                ...appReadyState.userAuthorities,
                loaded: false,
            },
        }

        expect(getAppReady(state)).toBe(false)
    })
})
