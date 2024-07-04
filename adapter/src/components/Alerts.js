import { useAlerts } from '@dhis2/app-service-alerts'
import { AlertStack, AlertBar } from '@dhis2/ui'
import React, { useCallback, useState } from 'react'

/* The alerts-manager which populates the `useAlerts` hook from
 * `@dhis2/app-service-alerts` hook with alerts only supports
 * simply adding and removing alerts. However, the `AlertBar`
 * from `@dhis2/ui` should leave the screen with a hide-animation.
 * This works well, for alerts that hide "naturally" (after the
 * timeout expires or when the close icon is clicked). In these
 * cases the componsent will request to be removed from the alerts-
 * manager after the animation completes. However, when
 * programatically hiding an alert this is the other way around:
 * the alert is removed from the alerts-manager straight away and
 * if we were to render the alerts from the `useAlerts` hook, these
 * alerts would be removed from the DOM abrubdly without an animation.
 * To prevent this from happening, we have implemented the
 * `useAlertsWithHideCache` hook:
 *  - It contains all alerts from the alert-manager, with
 *    `options.hidden` set to `false`
 *  - And also alerts which have been removed from the alert-manager,
 *    but still have their leave animation in progress, with
 *    `options.hidden` set to `true`
 *  - Alerts are removed once the `onHidden` callback fires */

const useAlertsWithHideCache = () => {
    const [alertsMap] = useState(new Map())
    /* We don't use this state value, it is used to trigger
     * a rerender to remove the hidden alert from the DOM */
    const [, setLastRemovedId] = useState(null)
    const alertManagerAlerts = useAlerts()
    const updateAlertsFromManager = useCallback(
        (newAlerts = []) => {
            const newAlertsIdLookup = new Set()
            newAlerts.forEach((alert) => {
                newAlertsIdLookup.add(alert.id)
                if (!alertsMap.has(alert.id)) {
                    // new alerts, these are not hiding
                    alertsMap.set(alert.id, {
                        ...alert,
                        options: {
                            ...alert.options,
                            hidden: alert.options.hidden || false,
                        },
                    })
                }
            })
            // alerts in alertsMap but not in newAlerts are hiding
            alertsMap.forEach((alert) => {
                if (!newAlertsIdLookup.has(alert.id)) {
                    alert.options.hidden = true
                }
            })
        },
        [alertsMap]
    )
    const removeAlert = useCallback(
        (id) => {
            alertsMap.delete(id)
            setLastRemovedId(id)
        },
        [alertsMap]
    )

    updateAlertsFromManager(alertManagerAlerts)

    return {
        alerts: Array.from(alertsMap.values()).sort((a, b) => a.id - b.id),
        removeAlert,
    }
}

const Alerts = () => {
    const { alerts, removeAlert } = useAlertsWithHideCache()

    return (
        <AlertStack>
            {alerts.map(
                ({ message, remove, id, options: { onHidden, ...props } }) => (
                    <AlertBar
                        {...props}
                        key={id}
                        onHidden={() => {
                            onHidden && onHidden()
                            removeAlert(id)
                            remove()
                        }}
                    >
                        {message}
                    </AlertBar>
                )
            )}
        </AlertStack>
    )
}

export { Alerts }
