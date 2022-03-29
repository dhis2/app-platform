export default function createAppConfig() {
    return {
        url:
            process.env.REACT_APP_DHIS2_BASE_URL ||
            window.localStorage.DHIS2_BASE_URL,
        appName: process.env.REACT_APP_DHIS2_APP_NAME || '',
        apiVersion: parseInt(process.env.REACT_APP_DHIS2_API_VERSION),
        pwaEnabled: process.env.REACT_APP_DHIS2_APP_PWA_ENABLED === 'true',
    }
}
