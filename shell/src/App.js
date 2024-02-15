import AppAdapter from '@dhis2/app-adapter'
import { Layer, layers, CenteredContent, CircularLoader } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import { PluginLoader } from './PluginLoader'
import { PluginOuterErrorBoundary } from './PluginOuterErrorBoundary'

const D2App = React.lazy(() =>
    import(/*webpackChunkName: 'app'*/ './D2App/app')
) // Automatic bundle splitting!

const parseRequiredProps = (propsEnvVariable) => {
    if (!propsEnvVariable || propsEnvVariable === '') {
        return []
    }
    return propsEnvVariable.split(',')
}

const isPlugin = process.env.REACT_APP_DHIS2_APP_PLUGIN === 'true'
const requiredPluginProps = parseRequiredProps(
    process.env.REACT_APP_DHIS2_APP_REQUIREDPROPS
)

const appConfig = {
    url: process.env.REACT_APP_DHIS2_BASE_URL,
    appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
    appVersion: process.env.REACT_APP_DHIS2_APP_VERSION || '',
    apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
    pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
    plugin: isPlugin,
    loginApp: process.env.REACT_APP_DHIS2_APP_LOGINAPP === 'true',
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
    if (isPlugin) {
        return <Plugin config={pluginConfig} />
    }
    return <App config={appConfig} />
}

export default AppOrPlugin
