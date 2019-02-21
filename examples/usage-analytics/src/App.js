import React from 'react'
import i18n from '@dhis2/d2-i18n'
import { Provider } from 'react-redux'
import HeaderBar from '@dhis2/ui/widgets/HeaderBar'
import store from './store'
import UsageAnalytics from './components/UsageAnalytics'

function App() {
    return (
        <Provider store={store}>
            <HeaderBar appName={i18n.t('Usage Analytics')} />
            <UsageAnalytics />
        </Provider>
    )
}

export default App
