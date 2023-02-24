import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import postRobot from 'post-robot'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useState } from 'react'

export const PluginLoader = ({ config, requiredProps, D2App }) => {
    const [propsFromParent, setPropsFromParent] = useState({})
    const [propsThatAreMissing, setPropsThatAreMissing] = useState([])
    const [parentAlertsAdd, setParentAlertsAdd] = useState(() => () => {})
    const [showAlertsInPlugin, setShowAlertsInPlugin] = useState(false)
    const [onPluginError, setOnPluginError] = useState(() => () => {})
    const [clearPluginError, setClearPluginError] = useState(() => () => {})

    const receivePropsFromParent = useCallback(
        (event) => {
            const { data: receivedProps } = event
            const {
                setInErrorState,
                setCommunicationReceived,
                alertsAdd,
                showAlertsInPlugin,
                onError,
                ...explicitlyPassedProps
            } = receivedProps

            setPropsFromParent(explicitlyPassedProps)

            // check for required props
            const missingProps = requiredProps?.filter(
                (prop) => !explicitlyPassedProps[prop]
            )

            // if there are missing props, set to state to throw error
            if (missingProps && missingProps.length > 0) {
                console.error(`These props are missing: ${missingProps.join()}`)
                setPropsThatAreMissing(missingProps)
            }

            if (setInErrorState) {
                if (onError) {
                    setOnPluginError(() => (error) => {
                        onError(error)
                    })
                }
            }

            // when users clears error, set communicationReceived=false to retrigger communication
            if (setCommunicationReceived) {
                setClearPluginError(() => () => {
                    setCommunicationReceived(false)
                })
            }

            if (alertsAdd) {
                setParentAlertsAdd(() => (alert, alertRef) => {
                    alertsAdd(alert, alertRef)
                })
            }

            if (showAlertsInPlugin) {
                setShowAlertsInPlugin(Boolean(showAlertsInPlugin))
            }
        },
        [
            requiredProps,
            setOnPluginError,
            setClearPluginError,
            setParentAlertsAdd,
            setShowAlertsInPlugin,
        ]
    )

    useEffect(() => {
        // make first request for props to communicate that iframe is ready
        postRobot
            .send(window.top, 'getPropsFromParent')
            .then(receivePropsFromParent)
            .catch((err) => {
                console.error(err)
            })
    }, [receivePropsFromParent])

    useEffect(() => {
        // set up listener to listen for subsequent sends from parent window
        const listener = postRobot.on(
            'updated',
            { window: window.top },
            (event) => {
                receivePropsFromParent(event)
            }
        )

        return () => listener.cancel()
    }, [receivePropsFromParent])

    // throw error if props are missing
    useEffect(() => {
        if (propsThatAreMissing.length > 0) {
            throw new Error(
                `These props are missing: ${propsThatAreMissing.join()}`
            )
        }
    }, [propsThatAreMissing])

    return (
        <AppAdapter
            parentAlertsAdd={parentAlertsAdd}
            showAlertsInPlugin={showAlertsInPlugin}
            onPluginError={onPluginError}
            clearPluginError={clearPluginError}
            {...config}
        >
            <React.Suspense
                fallback={
                    <Layer translucent level={layers.alert}>
                        <CenteredContent>
                            <CircularLoader />
                        </CenteredContent>
                    </Layer>
                }
            >
                <D2App config={config} {...propsFromParent} />
            </React.Suspense>
        </AppAdapter>
    )
}

PluginLoader.propTypes = {
    D2App: PropTypes.object,
    config: PropTypes.object,
    requiredProps: PropTypes.array,
}
