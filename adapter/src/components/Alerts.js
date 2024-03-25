import { useAlerts } from '@dhis2/app-runtime'
import { AlertBar, AlertStack } from '@dhis2/ui'
import React, { useState, useEffect } from 'react'

/*
 * The alert-manager which populates the `useAlerts` hook from `@dhis2/app-service-alerts`
 * hook with alerts only supports simply adding and removing alerts. However, the
 * `AlertBar` from `@dhis2/ui` should leave the screen with a hide-animation, so this
 * requires an additional state. The `alertStackAlerts` state in the Alerts component
 * provides this addional state:
 *  - It contains all alerts from the alert-manager, with `options.hidden` set to `false`
 *  - And also alerts which have been removed from the alert-manager, but still have their
 *    leave animation in progress, whtih `options.hidden` set to `true`)
 * Alerts are removed from the `alertStackAlerts` state once the `onHidden` callback fires
 */

const Alerts = () => {
    const alertManagerAlerts = useAlerts()
    const [alertStackAlerts, setAlertStackAlerts] = useState(alertManagerAlerts)
    const removeAlertStackAlert = (id) =>
        setAlertStackAlerts(
            alertStackAlerts.filter(
                (alertStackAlert) => alertStackAlert.id !== id
            )
        )

    useEffect(() => {
        setAlertStackAlerts((currentAlertStackAlerts) =>
            mergeAlertStackAlerts(currentAlertStackAlerts, alertManagerAlerts)
        )
    }, [alertManagerAlerts])

    return (
        <AlertStack>
            {alertStackAlerts.map(
                ({ message, remove, id, options: { onHidden, ...props } }) => (
                    <AlertBar
                        {...props}
                        key={id}
                        onHidden={() => {
                            onHidden && onHidden()
                            removeAlertStackAlert(id)
                            if (alertManagerAlerts.some((a) => a.id === id)) {
                                remove()
                            }
                        }}
                    >
                        {message}
                    </AlertBar>
                )
            )}
        </AlertStack>
    )
}

function mergeAlertStackAlerts(alertStackAlerts, alertManagerAlerts) {
    return Object.values({
        /*
         * Assume that all alerts in the alertStackAlerts array are hiding.
         * After the object merge only the alerts not in the alertManagerAlerts
         * array will have `options.hidden === true`.
         */
        ...toIdBasedObjectWithHiddenOption(alertStackAlerts, true),
        /*
         * All alertManagerAlerts should be showing. This object merge will
         * overwrite any alertStackAlert by the alertManagerAlert with
         * the same `id`, thus ensuring the alert is visible.
         */
        ...toIdBasedObjectWithHiddenOption(alertManagerAlerts, false),
    })
}

function toIdBasedObjectWithHiddenOption(arr, hidden) {
    return arr.reduce((obj, item) => {
        obj[item.id] = {
            ...item,
            options: {
                ...item.options,
                hidden,
            },
        }
        return obj
    }, {})
}

export { Alerts, mergeAlertStackAlerts }
