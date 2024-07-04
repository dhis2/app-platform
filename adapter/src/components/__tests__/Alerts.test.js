import { useAlert } from '@dhis2/app-runtime'
import { AlertsProvider } from '@dhis2/app-service-alerts'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'
import React from 'react'
import { Alerts } from '../Alerts.js'

describe('Alerts', () => {
    beforeEach(() => {
        jest.useFakeTimers()
    })

    const Wrapper = ({ children }) => (
        <AlertsProvider>
            {children}
            <Alerts />
        </AlertsProvider>
    )

    const AlertButtons = ({ message, options, label }) => {
        const { show, hide } = useAlert(message, options)

        return (
            <>
                <button className="show" onClick={show}>
                    {label ? `Show ${label}` : 'Show'}
                </button>
                <button className="hide" onClick={hide}>
                    {label ? `Hide ${label}` : 'Hide'}
                </button>
            </>
        )
    }

    it('can show an alert', async () => {
        const msg = 'TEST ALERT'
        render(
            <Wrapper>
                <AlertButtons message={msg} />
            </Wrapper>
        )

        act(() => {
            fireEvent.click(screen.getByText('Show'))
        })

        await waitFor(() => screen.getByText(msg))
        expect(screen.getAllByText(msg)).toHaveLength(1)
    })

    it('can hide an alert', async () => {
        const msg = 'TEST ALERT'
        render(
            <Wrapper>
                <AlertButtons message={msg} />
            </Wrapper>
        )

        act(() => {
            fireEvent.click(screen.getByText('Show'))
        })

        await waitFor(() => screen.getByText(msg))
        expect(screen.getAllByText(msg)).toHaveLength(1)

        act(() => {
            fireEvent.click(screen.getByText('Hide'))
            jest.runAllTimers()
        })

        expect(screen.queryByText(msg)).toBeNull()
    })

    it('keeps the alert in the DOM while hiding', async () => {
        const msg = 'TEST ALERT'
        render(
            <Wrapper>
                <AlertButtons message={msg} />
            </Wrapper>
        )

        act(() => {
            fireEvent.click(screen.getByText('Show'))
        })

        // It's there after show is called
        await waitFor(() => screen.getByText(msg))
        expect(screen.getAllByText(msg)).toHaveLength(1)

        act(() => {
            fireEvent.click(screen.getByText('Hide'))
            // Less than the animation duration
            jest.advanceTimersByTime(100)
        })

        // Still there 100ms after hide is called
        expect(screen.getAllByText(msg)).toHaveLength(1)

        act(() => {
            jest.runAllTimers()
        })

        // But eventually it is gone
        expect(screen.queryByText(msg)).toBeNull()
    })
    it('removes multiple alerts that hide simultaniously correctly', async () => {
        /* This test case was added to reproduce and fix a bug that
         * would cause the second alert to be re-added during the
         * removal of the first alert. */
        const duration = 1000
        const options = { duration }
        const message1 = 'message 1'
        const message2 = 'message 2'

        render(
            <Wrapper>
                <AlertButtons
                    message={message1}
                    label={message1}
                    options={options}
                />
                <AlertButtons
                    message={message2}
                    label={message2}
                    options={options}
                />
            </Wrapper>
        )

        act(() => {
            fireEvent.click(screen.getByText(`Show ${message1}`))
            /* A small delay between hides is required to reproduce the bug,
             * because if the hiding is done at the same time, the alerts
             * would both be removed correctly */
            jest.advanceTimersByTime(10)
            fireEvent.click(screen.getByText(`Show ${message2}`))
        })

        // Both message should show
        await waitFor(() => screen.getByText(message1))
        await waitFor(() => screen.getByText(message2))
        expect(screen.getAllByText(message1)).toHaveLength(1)
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            jest.advanceTimersByTime(duration)
        })

        // Both should still be there while the hide animation runs
        expect(screen.getAllByText(message1)).toHaveLength(1)
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            // Now we advance the time until the hide animation completes
            jest.advanceTimersByTime(700)
        })

        /* Now both should be gone. Prior to the bugfix,
         * the alert with message2 would be showing */
        expect(screen.queryByText(message1)).toBeNull()
        expect(screen.queryByText(message2)).toBeNull()
    })
    it('keeps alerts that have been removed programatically around until the animation is done', async () => {
        const options = { permanent: true }
        const message1 = 'message 1'
        const message2 = 'message 2'

        render(
            <Wrapper>
                <AlertButtons
                    message={message1}
                    label={message1}
                    options={options}
                />
                <AlertButtons
                    message={message2}
                    label={message2}
                    options={options}
                />
            </Wrapper>
        )

        act(() => {
            fireEvent.click(screen.getByText(`Show ${message1}`))
            fireEvent.click(screen.getByText(`Show ${message2}`))
        })

        // Both message should show
        await waitFor(() => screen.getByText(message1))
        await waitFor(() => screen.getByText(message2))
        expect(screen.getAllByText(message1)).toHaveLength(1)
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            fireEvent.click(screen.getByText(`Hide ${message1}`))
            jest.advanceTimersByTime(50)
        })

        // Both should still be there while the hide animation runs
        expect(screen.getAllByText(message1)).toHaveLength(1)
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            // Now we advance the time until the hide animation completes
            jest.advanceTimersByTime(1000)
        })

        // The alert that was hidden should now be gone
        expect(screen.queryByText(message1)).toBeNull()
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            fireEvent.click(screen.getByText(`Hide ${message2}`))
            jest.advanceTimersByTime(50)
        })

        // The second alert should still be there while its hide animation runs
        expect(screen.queryByText(message1)).toBeNull()
        expect(screen.getAllByText(message2)).toHaveLength(1)

        act(() => {
            fireEvent.click(screen.getByText(`Hide ${message2}`))
            jest.advanceTimersByTime(700)
        })

        // Now both should be gone
        expect(screen.queryByText(message1)).toBeNull()
        expect(screen.queryByText(message2)).toBeNull()
    })
})
