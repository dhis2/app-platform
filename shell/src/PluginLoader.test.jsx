import { render, act, waitFor } from '@testing-library/react'
import postRobot from 'post-robot'
import React from 'react'
import { PluginLoader } from './PluginLoader.jsx'

// Mock AppAdapter to record the props PluginLoader renders it with.
// `virtual: true` lets jest mock the adapter even if it hasn't been built,
// because its package.json `main` points at the build output
const mockAppAdapterProps = []
jest.mock(
    '@dhis2/app-adapter',
    () => ({
        __esModule: true,
        default: (props) => {
            mockAppAdapterProps.push(props)
            return null
        },
    }),
    { virtual: true }
)

// The real shell passes D2App as a React.lazy component, which is an object,
// and PluginLoader's propTypes expect one. React.memo also returns an object
const MockD2App = React.memo(function MockD2App() {
    return null
})

// The tests use the real post-robot. In jsdom the test window has no parent,
// so `window.parent === window`, and a test acts as the host by listening and
// sending on `window`. jsdom's postMessage sets neither `event.source` nor
// `event.origin`, and post-robot ignores messages without them, so replace it
// with one that sets both
const originalPostMessage = window.postMessage
beforeAll(() => {
    window.postMessage = (data) =>
        setTimeout(() =>
            window.dispatchEvent(
                new MessageEvent('message', {
                    data,
                    source: window,
                    origin: window.location.origin,
                })
            )
        )
})
afterAll(() => {
    window.postMessage = originalPostMessage
})

// post-robot keeps its listeners in module state, and a second listener for
// the same message name throws, so cancel the host's listener after each test
let hostListener
afterEach(() => {
    hostListener?.cancel()
    mockAppAdapterProps.length = 0
})

const latestParentAlertsAdd = () =>
    mockAppAdapterProps[mockAppAdapterProps.length - 1].parentAlertsAdd

const renderPluginLoader = async (initialProps) => {
    hostListener = postRobot.on('getPropsFromParent', () => initialProps)
    render(<PluginLoader config={{}} D2App={MockD2App} />)
    // AppAdapter renders once on mount and again once the host's reply arrives
    await waitFor(() => expect(mockAppAdapterProps.length).toBeGreaterThan(1))
}

const sendUpdatedFromHost = (props) =>
    act(() => postRobot.send(window, 'updated', props))

describe('parentAlertsAdd', () => {
    it('keeps the same identity when the host sends a new alertsAdd', async () => {
        await renderPluginLoader({ alertsAdd: jest.fn() })
        const initial = latestParentAlertsAdd()

        await sendUpdatedFromHost({ alertsAdd: jest.fn() })
        await sendUpdatedFromHost({ alertsAdd: jest.fn() })

        expect(latestParentAlertsAdd()).toBe(initial)
    })

    it('calls the latest alertsAdd from the host and returns its result', async () => {
        const firstAlertsAdd = jest.fn()
        await renderPluginLoader({ alertsAdd: firstAlertsAdd })
        const parentAlertsAdd = latestParentAlertsAdd()

        const secondAlertsAdd = jest.fn(() => ({ id: 'parent-alert' }))
        await sendUpdatedFromHost({ alertsAdd: secondAlertsAdd })

        // Through post-robot, alertsAdd returns a promise of its result
        const alert = { message: 'Hello' }
        const alertRef = { current: null }
        await expect(parentAlertsAdd(alert, alertRef)).resolves.toEqual({
            id: 'parent-alert',
        })
        expect(secondAlertsAdd).toHaveBeenCalledWith(alert, alertRef)
        expect(firstAlertsAdd).not.toHaveBeenCalled()
    })

    it('does nothing and returns undefined before alertsAdd has been received', async () => {
        await renderPluginLoader({})

        expect(latestParentAlertsAdd()({ message: 'Hello' })).toBeUndefined()
    })
})
