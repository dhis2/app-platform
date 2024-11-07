import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { PluginLoader } from './PluginLoader.jsx'
import { PluginOuterErrorBoundary } from './PluginOuterErrorBoundary.jsx'

// This placeholder component gets replaced at shell-bootstrapping time by
// `React.lazy(() => import('./D2App/<entryPoint>'))`
// The lazy import provides bundle splitting
const D2App = () => <div id="dhis2-placeholder" />

// Injected by backend when serving index or plugin HTML
// https://github.com/dhis2/dhis2-core/pull/16703
const getInjectedBaseUrl = () => {
    const baseUrl = document
        .querySelector('meta[name="dhis2-base-url"]')
        ?.getAttribute('content')
    if (baseUrl && baseUrl !== '__DHIS2_BASE_URL__') {
        return baseUrl
    }
    return null
}

const parseRequiredProps = (propsEnvVariable) => {
    if (!propsEnvVariable || propsEnvVariable === '') {
        return []
    }
    return propsEnvVariable.split(',')
}

// Since apps and plugins share the same env with Vite, this value is injected
// via string replacement in cli/src/lib/compiler/entrypoints.js
const isPlugin = self.__IS_PLUGIN

const skipPluginLogic =
    process.env.REACT_APP_DHIS2_APP_SKIPPLUGINLOGIC === 'true'
const requiredPluginProps = parseRequiredProps(
    process.env.REACT_APP_DHIS2_APP_REQUIREDPROPS
)

const appConfig = {
    url: getInjectedBaseUrl() || process.env.REACT_APP_DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
    apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
    pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
    plugin: isPlugin,
    loginApp: process.env.REACT_APP_DHIS2_APP_LOGINAPP === 'true',
    direction: process.env.REACT_APP_DHIS2_APP_DIRECTION,
}

const pluginConfig = {
    ...appConfig,
    requiredProps: requiredPluginProps,
}

const App = ({ config }) => (
    <AppAdapter {...config}>
        <React.Suspense
            fallback={
                <Layer level={layers.alert}>
                    <CenteredContent>
                        <CircularLoader />
                    </CenteredContent>
                </Layer>
            }
        >
            <D2App config={config} />
        </React.Suspense>
    </AppAdapter>
)

App.propTypes = {
    config: PropTypes.object,
}

const Plugin = ({ config }) => {
    return (
        <PluginOuterErrorBoundary>
            <PluginLoader
                config={config}
                requiredProps={requiredPluginProps}
                D2App={D2App}
            />
        </PluginOuterErrorBoundary>
    )
}

Plugin.propTypes = {
    config: PropTypes.object,
}

const AppOrPlugin = () => {
    if (isPlugin && !skipPluginLogic) {
        return <Plugin config={pluginConfig} />
    }
    return <App config={appConfig} />
}

export default AppOrPlugin
