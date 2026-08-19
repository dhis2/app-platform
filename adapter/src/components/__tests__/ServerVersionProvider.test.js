import { Provider } from '@dhis2/app-runtime'
import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { get } from '../../utils/api.js'
import { ServerVersionProvider } from '../ServerVersionProvider.js'

jest.mock('@dhis2/app-runtime', () => ({
    Provider: jest.fn(({ children }) => children),
}))

jest.mock('@dhis2/pwa', () => ({
    getBaseUrlByAppName: jest.fn(() => Promise.resolve(undefined)),
    setBaseUrlByAppName: jest.fn(() => Promise.resolve()),
    OfflineInterface: jest.fn(),
}))

jest.mock('../../utils/api.js', () => ({
    get: jest.fn(),
}))

const abortableResolve = (value) => {
    const promise = Promise.resolve(value)
    promise.abort = jest.fn()
    return promise
}

const props = {
    appName: 'test-app',
    appUrlSlug: 'test-app',
    appVersion: '1.2.3',
    url: 'http://localhost:8080',
    pwaEnabled: false,
}

const lastConfig = () =>
    Provider.mock.calls[Provider.mock.calls.length - 1][0].config

describe('ServerVersionProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        get.mockImplementation((url) =>
            url.endsWith('/api/me')
                ? abortableResolve({ id: 'user-id' })
                : abortableResolve({ version: '2.41.1' })
        )
    })

    it('provides the same config object across re-renders', async () => {
        const { rerender } = render(
            <ServerVersionProvider {...props}>
                <div />
            </ServerVersionProvider>
        )

        await waitFor(() => expect(Provider).toHaveBeenCalled())
        const config = lastConfig()
        const callCount = Provider.mock.calls.length

        rerender(
            <ServerVersionProvider {...props}>
                <div />
            </ServerVersionProvider>
        )

        // The re-render must actually reach Provider, or the test proves nothing
        expect(Provider.mock.calls.length).toBeGreaterThan(callCount)
        expect(lastConfig()).toBe(config)
    })

    it('parses the server version into the config', async () => {
        render(
            <ServerVersionProvider {...props}>
                <div />
            </ServerVersionProvider>
        )

        await waitFor(() => expect(Provider).toHaveBeenCalled())
        expect(lastConfig()).toMatchObject({
            apiVersion: 41,
            appVersion: { major: 1, minor: 2, patch: 3 },
            serverVersion: { major: 2, minor: 41, patch: 1 },
        })
    })

    it('does not warn about the server version while system info loads', async () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})

        render(
            <ServerVersionProvider {...props}>
                <div />
            </ServerVersionProvider>
        )

        // Nothing to parse yet — must not warn about an undefined version
        expect(warn).not.toHaveBeenCalled()

        await waitFor(() => expect(Provider).toHaveBeenCalled())
        expect(warn).not.toHaveBeenCalled()

        warn.mockRestore()
    })
})
