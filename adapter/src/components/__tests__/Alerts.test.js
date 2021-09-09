import { useAlert } from '@dhis2/app-runtime'
import { AlertsProvider } from '@dhis2/app-service-alerts'
import { act, render, fireEvent, waitFor, screen } from '@testing-library/react'
import React from 'react'
import { Alerts, mergeAlertStackAlerts } from '../Alerts.js'

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

    const AlertButtons = ({ message, options }) => {
        const { show, hide } = useAlert(message, options)

        return (
            <>
                <button className="show" onClick={show}>
                    Show
                </button>
                <button className="hide" onClick={hide}>
                    Hide
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
})

describe('mergeAlertStackAlerts', () => {
    it('add alerts from the alert manager and adds `hidden: false` to the options', () => {
        const alertStackAlerts = []
        const alertManagerAlerts = [
            {
                id: 1,
                message: 'test1',
                options: { permanent: true },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true },
            },
        ]
        expect(
            mergeAlertStackAlerts(alertStackAlerts, alertManagerAlerts)
        ).toEqual([
            {
                id: 1,
                message: 'test1',
                options: { hidden: false, permanent: true },
            },
            {
                id: 2,
                message: 'test2',
                options: { hidden: false, permanent: true },
            },
        ])
    })
    it('keeps alerts unchanged if the alert-manager and alert-stack contain equivalent items', () => {
        const alertStackAlerts = [
            {
                id: 1,
                message: 'test1',
                options: { permanent: true, hidden: false },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true, hidden: false },
            },
        ]
        const alertManagerAlerts = [
            {
                id: 1,
                message: 'test1',
                options: { permanent: true },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true },
            },
        ]
        expect(
            mergeAlertStackAlerts(alertStackAlerts, alertManagerAlerts)
        ).toEqual(alertStackAlerts)
    })
    it('keeps alerts in the alert-stack and sets `hidden` to `true` if they are no longer in the alert-manager', () => {
        const alertStackAlerts = [
            {
                id: 1,
                message: 'test1',
                options: { permanent: true, hidden: false },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true, hidden: false },
            },
        ]
        const alertManagerAlerts = [
            {
                id: 2,
                message: 'test2',
                options: { permanent: true },
            },
        ]
        expect(
            mergeAlertStackAlerts(alertStackAlerts, alertManagerAlerts)
        ).toEqual([
            {
                id: 1,
                message: 'test1',
                options: { permanent: true, hidden: true },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true, hidden: false },
            },
        ])
    })
    it('updates alerts in the alert-stack with the properties of the alerts in the alert-manager', () => {
        const alertStackAlerts = [
            {
                id: 1,
                message: 'test1',
                options: { permanent: true, hidden: false },
            },
            {
                id: 2,
                message: 'test2',
                options: { permanent: true, hidden: false },
            },
        ]
        const alertManagerAlerts = [
            {
                id: 1,
                message: 'test1 EDITED',
                options: { success: true },
            },
            {
                id: 2,
                message: 'test2 EDITED',
                options: { success: true },
            },
        ]
        expect(
            mergeAlertStackAlerts(alertStackAlerts, alertManagerAlerts)
        ).toEqual([
            {
                id: 1,
                message: 'test1 EDITED',
                options: { success: true, hidden: false },
            },
            {
                id: 2,
                message: 'test2 EDITED',
                options: { success: true, hidden: false },
            },
        ])
    })
})
