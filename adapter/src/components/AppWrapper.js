import { HeaderBar } from '@dhis2/ui'
import { styles } from './styles/AppWrapper.style.js'
import { useCurrentUserLocale } from '../utils/useLocale.js'
import { LoadingMask } from './LoadingMask.js'
import { Alerts } from './Alerts.js'

export const AppWrapper = ({ url, appName, children }) => {
    const { loading } = useCurrentUserLocale()

    if (loading) {
        return <LoadingMask />
    }

    return (
        <div className="app-shell-adapter">
            <style jsx>{styles}</style>
            <HeaderBar appName={appName} />
            <div className="app-shell-app">{children}</div>
            <Alerts />
        </div>
    )
}
