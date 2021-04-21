import { useAlerts } from '@dhis2/app-runtime'
import { AlertBar, AlertStack } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

const toIdBasedObjectWithHiddenOption = (arr, hidden) =>
    arr.reduce((obj, item) => {
        obj[item.id] = {
            ...item,
            options: {
                ...item.options,
                hidden,
            },
        }
        return obj
    }, {})

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

export class AlertsInternal extends Component {
    constructor(props) {
        super(props)
        this.state = {
            alertStackAlerts: props.alertManagerAlerts,
        }
    }

    static getDerivedStateFromProps(props, state) {
        const isEqual =
            props.alertManagerAlerts.map(({ id }) => id).join() ===
            state.alertStackAlerts.map(({ id }) => id).join()

        console.log('isEqual: ', isEqual)

        if (!isEqual) {
            return {
                alertStackAlerts: Object.values({
                    /*
                     * Assume that all alerts in the alertStackAlerts array are hiding.
                     * After the object merge only the alerts not in the alertManagerAlerts
                     * array will have `options.hidden === true`.
                     */
                    ...toIdBasedObjectWithHiddenOption(
                        state.alertStackAlerts,
                        true
                    ),
                    /*
                     * All alertManagerAlerts should be showing. This object merge will
                     * overwrite any alertStackAlert by the alertManagerAlert with
                     * the same `id`, thus ensuring the alert is visible.
                     */
                    ...toIdBasedObjectWithHiddenOption(
                        props.alertManagerAlerts,
                        false
                    ),
                }),
            }
        }

        return null
    }

    removeAlertStackAlert = id => {
        // if (
        //     this.state.alertStackAlerts.find(
        //         alertStackAlert => alertStackAlert.id === id
        //     )
        // ) {
        this.setState({
            alertStackAlerts: this.state.alertStackAlerts.filter(
                alertStackAlert => alertStackAlert.id !== id
            ),
        })
        // }
    }

    render() {
        console.log(
            '+++\n',
            'am: ',
            this.props.alertManagerAlerts.map(({ id }) => id).join() || 'none',
            '\n',
            'as: ',
            this.state.alertStackAlerts.map(({ id }) => id).join() || 'none',
            '\nat:',
            performance.now(),
            '\n---\n'
        )

        return (
            <AlertStack>
                {this.state.alertStackAlerts.map(
                    ({
                        message,
                        remove,
                        id,
                        options: { onHidden, ...props },
                    }) => (
                        <AlertBar
                            {...props}
                            key={id}
                            onHidden={() => {
                                onHidden && onHidden()
                                this.removeAlertStackAlert(id)
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
}

AlertsInternal.propTypes = {
    alertManagerAlerts: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number,
            message: PropTypes.string,
            options: PropTypes.shape({
                onHidden: PropTypes.bool,
            }),
            remove: PropTypes.func,
        })
    ),
}

export const Alerts = () => {
    const alertManagerAlerts = useAlerts()
    return <AlertsInternal alertManagerAlerts={alertManagerAlerts} />
}
