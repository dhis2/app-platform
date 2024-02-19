import { useConfig } from '@dhis2/app-runtime'
// eslint-disable-next-line import/no-unresolved
import { Plugin } from '@dhis2/app-runtime/experimental'
import { HeaderBar } from '@dhis2/ui'
import PropTypes from 'prop-types'
import React from 'react'
import {
    BrowserRouter,
    Routes,
    Route,
    useLocation,
    Link,
    useParams,
} from 'react-router-dom'
import styles from './App.module.css'

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

const Layout = ({ children }) => {
    return (
        <>
            <HeaderBar className={'global-shell-header'} />
            <div className={styles.container}>{children}</div>
        </>
    )
}
Layout.propTypes = { children: PropTypes.node }

// Save this so it can be used after browser URL changes
const originalLocation = new URL(window.location.href)

const getPluginSource = async (appName, baseUrl) => {
    const absoluteBaseUrl = new URL(baseUrl, originalLocation)

    if (appName.startsWith('dhis-web')) {
        return new URL(`./${appName}/`, absoluteBaseUrl).href
    }

    const appBasePath = appName.startsWith('dhis-web')
        ? `./${appName}`
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

const PluginLoader = () => {
    const params = useParams()
    const location = useLocation()
    const { baseUrl } = useConfig()
    const [pluginSource, setPluginSource] = React.useState()

    React.useEffect(() => {
        const asyncWork = async () => {
            const pluginSource =
                params.appName === 'localApp'
                    ? 'http://localhost:3001/app.html'
                    : await getPluginSource(params.appName, baseUrl)
            setPluginSource(pluginSource + location.hash)
        }
        asyncWork()
    }, [params.appName, baseUrl, location.hash])

    return (
        <Plugin
            width={'100%'}
            height={'100%'}
            pluginSource={pluginSource}
            onLoad={injectHeaderbarHidingStyles}
        />
    )
}

// todo: also listen to navigations inside iframe (e.g. "Open this dashboard item in DV" links)
// (Could the `window` prop on BrowserRouter help here?)
const MyApp = () => {
    const { baseUrl, appName } = useConfig()

    const basename = React.useMemo(() => {
        if (process.env.NODE_ENV === 'development') {
            return // undefined is okay
        }
        const absoluteBaseUrl = new URL(baseUrl, originalLocation)
        return new URL(`./api/apps/${appName}/`, absoluteBaseUrl).pathname
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <BrowserRouter basename={basename}>
            <Layout>
                <Routes>
                    <Route
                        path="*"
                        element={<Link to="/app/localApp">Local App</Link>}
                    ></Route>
                    <Route path="/app/:appName" element={<PluginLoader />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    )
}

export default MyApp
