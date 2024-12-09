import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import postRobot from 'post-robot'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useRef, useState } from 'react'

const PluginResizeInner = ({
    D2App,
    config,
    propsFromParent,
    resizePluginHeight,
    resizePluginWidth,
}) => {
    const divRef = useRef()
    const innerDivRef = useRef()
    useEffect(() => {
        if (divRef && divRef.current && resizePluginHeight) {
            const container = divRef.current
            const resizeObserver = new ResizeObserver(() => {
                // the additional pixels currently account for possible horizontal scroll bar
                resizePluginHeight(container.offsetHeight + 20)
            })
            resizeObserver.observe(container)
            return () => {
                resizeObserver.unobserve(container);
                resizeObserver.disconnect();
            };
        }
    }, [resizePluginHeight])

    const previousWidth = useRef()

    const resetWidth = useCallback(() => {
        const currentWidth = innerDivRef.current?.scrollWidth
        if (resizePluginWidth && currentWidth) {
            if (
                previousWidth.current &&
                Math.abs(currentWidth - previousWidth.current) > 20
            ) {
                resizePluginWidth(currentWidth + 20)
            }
            previousWidth.current = currentWidth
        }
        requestAnimationFrame(resetWidth)
    }, [resizePluginWidth])

    useEffect(() => {
        if (resizePluginWidth) {
            requestAnimationFrame(resetWidth)
        }
    }, [resetWidth, resizePluginWidth])

    // inner div disables margin collapsing which would prevent computing correct height
    return (
        <div ref={divRef}>
            <div>
                <div id="innerDiv" ref={innerDivRef}>
                    <D2App
                        config={config}
                        resizePluginWidth={resizePluginWidth}
                        {...propsFromParent}
                    />
                </div>
            </div>
        </div>
    )
}

PluginResizeInner.propTypes = {
    D2App: PropTypes.object,
    config: PropTypes.object,
    propsFromParent: PropTypes.object,
    resizePluginHeight: PropTypes.func,
    resizePluginWidth: PropTypes.func,
}

const PluginInner = ({
    D2App,
    config,
    propsFromParent,
    resizePluginHeight,
    resizePluginWidth,
}) => {
    if (!resizePluginHeight && !resizePluginWidth) {
        return (
            <D2App
                config={config}
                resizePluginWidth={resizePluginWidth}
                {...propsFromParent}
            />
        )
    }
    return (
        <PluginResizeInner
            D2App={D2App}
            config={config}
            propsFromParent={propsFromParent}
            resizePluginHeight={resizePluginHeight}
            resizePluginWidth={resizePluginWidth}
        />
    )
}

PluginInner.propTypes = {
    D2App: PropTypes.object,
    config: PropTypes.object,
    propsFromParent: PropTypes.object,
    resizePluginHeight: PropTypes.func,
    resizePluginWidth: PropTypes.func,
}

export const PluginLoader = ({ config, requiredProps, D2App }) => {
    const [propsFromParent, setPropsFromParent] = useState({})
    const [propsThatAreMissing, setPropsThatAreMissing] = useState([])
    const [parentAlertsAdd, setParentAlertsAdd] = useState(() => () => {})
    const [showAlertsInPlugin, setShowAlertsInPlugin] = useState(false)
    const [onPluginError, setOnPluginError] = useState(() => () => {})
    const [clearPluginError, setClearPluginError] = useState(() => () => {})
    const [resizePluginHeight, setResizePluginHeight] = useState(null)
    const [resizePluginWidth, setResizePluginWidth] = useState(null)

    const receivePropsFromParent = useCallback(
        (event) => {
            const { data: receivedProps } = event
            const {
                setInErrorState,
                setCommunicationReceived,
                alertsAdd,
                showAlertsInPlugin,
                height,
                setPluginHeight,
                width,
                setPluginWidth,
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
                setParentAlertsAdd(
                    () => (alert, alertRef) => alertsAdd(alert, alertRef)
                )
            }

            if (showAlertsInPlugin) {
                setShowAlertsInPlugin(Boolean(showAlertsInPlugin))
            }

            if (!height && setPluginHeight) {
                setResizePluginHeight(() => (height) => setPluginHeight(height))
            }

            if (!width && setPluginWidth) {
                setResizePluginWidth(() => (width) => setPluginWidth(width))
            }
        },
        [
            requiredProps,
            setOnPluginError,
            setClearPluginError,
            setParentAlertsAdd,
            setShowAlertsInPlugin,
            setResizePluginHeight,
            setResizePluginWidth,
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
                    <Layer level={layers.alert}>
                        <CenteredContent>
                            <CircularLoader />
                        </CenteredContent>
                    </Layer>
                }
            >
                <PluginInner
                    D2App={D2App}
                    config={config}
                    propsFromParent={propsFromParent}
                    resizePluginHeight={resizePluginHeight}
                    resizePluginWidth={resizePluginWidth}
                />
            </React.Suspense>
        </AppAdapter>
    )
}

PluginLoader.propTypes = {
    D2App: PropTypes.object,
    config: PropTypes.object,
    requiredProps: PropTypes.array,
}
