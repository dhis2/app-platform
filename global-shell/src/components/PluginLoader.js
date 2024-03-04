import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import PropTypes from 'prop-types'
import React from 'react'
// eslint-disable-next-line import/no-unresolved
import { useLocation, useParams } from 'react-router-dom'

// Doesn't work on maintenance app
// Doesn't work cross-domain
const injectHeaderbarHidingStyles = (event) => {
    try {
        const iframe = event?.target || document.querySelector('iframe')
        const doc = iframe.contentDocument
        const styleElement = doc.createElement('style')
        styleElement.textContent =
            'div.app-shell-adapter > header { display: none; }'
        doc.head.appendChild(styleElement)
    } catch (err) {
        console.error(
            'Failed to apply styles to the client app to hide its header bar. ' +
                'This could be due to the client app being hosted on a different domain.',
            err
        )
    }
}

// Save this so it can be used after browser URL changes
const originalLocation = new URL(window.location.href)

const getPluginSource = async (appName, baseUrl) => {
    const absoluteBaseUrl = new URL(baseUrl, originalLocation)

    if (appName.startsWith('dhis-web')) {
        console.log({ appName })

        // todo: this could be done with smarter apps info API
        // (neither api/apps/menu nor getModules.action have all correct answers)
        const relativePath =
            appName === 'dhis-web-dataentry'
                ? `./${appName}/index.action`
                : `./${appName}/`
        return new URL(relativePath, absoluteBaseUrl).href
    }

    const appBasePath = appName.startsWith('dhis-web')
        ? `./${appName}/`
        : `./api/apps/${appName}/`
    const appRootUrl = new URL(appBasePath, absoluteBaseUrl)
    const pluginifiedAppEntrypoint = new URL('./app.html', appRootUrl)

    const pluginifiedAppResponse = await fetch(pluginifiedAppEntrypoint)
    if (pluginifiedAppResponse.ok) {
        return pluginifiedAppEntrypoint.href
    }
    // If pluginified app is not found, fall back to app root
    return appRootUrl.href
}

export const PluginLoader = ({
    setClientPWAUpdateAvailable,
    setOnApplyClientUpdate,
}) => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()
    const [pluginSource, setPluginSource] = React.useState()

    // test prop messaging and updates
    const [color, setColor] = React.useState('blue')
    const toggleColor = React.useCallback(
        () => setColor((prev) => (prev === 'blue' ? 'red' : 'blue')),
        []
    )

    React.useEffect(() => {
        const asyncWork = async () => {
            const newPluginSource =
                params.appName === 'localApp'
                    ? 'http://localhost:3001/app.html'
                    : await getPluginSource(params.appName, baseUrl)
            setPluginSource(newPluginSource)
        }
        asyncWork()
    }, [params.appName, baseUrl])

    return (
        <Plugin
            width={'100%'}
            height={'100%'}
            // todo: only for apps without header bars
            // height={'calc(100% - 48px)'}
            // pass URL hash down to the client app
            pluginSource={pluginSource + location.hash}
            onLoad={injectHeaderbarHidingStyles}
            // Other props
            reportPWAUpdateStatus={(data) => {
                const { updateAvailable, onApplyUpdate } = data
                console.log('recieved PWA status', { data })

                setClientPWAUpdateAvailable(updateAvailable)
                if (onApplyUpdate) {
                    // Return function from a function -- otherwise, setState tries to invoke the function
                    // to evaluate its next state
                    setOnApplyClientUpdate(() => onApplyUpdate)
                }
            }}
            // props test
            color={color}
            toggleColor={toggleColor}
        />
    )
}
PluginLoader.propTypes = {
    setClientPWAUpdateAvailable: PropTypes.func,
    setOnApplyClientUpdate: PropTypes.func,
}
