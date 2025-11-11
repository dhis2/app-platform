import type { UserConfig } from 'vite'

/**
 * The DHIS2 application platform configuration file is d2.config.js.
 * It should be placed in the root directory of your project, next to package.json
 * The default export from d2.config.js should be a JSON-srializable object.
 * All properties are technically optional, but it is recommended to set them explicitly.
 *
 * @see https://developers.dhis2.org/docs/app-platform/config/d2-config-js-reference
 */
export type D2Config = Partial<{
    /**
     * The ID of the app on the App Hub (https://apps.dhis2.org). Used when publishing the app to the App Hub with d2 app scripts publish. See this guide to learn how to set up continuous delivery.
     *
     * @see https://developers.dhis2.org/docs/guides/publish-apphub/
     */
    id: string

    /**
     * Either app, login_app or lib
     * @see https://developers.dhis2.org/docs/app-platform/config/d2-config-js-reference
     */
    type: 'app' | 'login_app' | 'lib'

    /**
     * A short, machine-readable unique name for this app
     * @default "the name in package.json"
     */
    name: string

    /**
     * Sets the dir HTML attribute on the document of the app. If set to 'auto', the direction will be inferred from the current user's UI locale setting. The header bar will always be considered 'auto' and is unaffected by this setting.
     * @default "ltr"
     */
    dir: 'ltr' | 'rtl' | 'auto'

    /**
     * The human-readable application title, which will appear in the HeaderBar
     * @default pkg.title
     */
    title: string

    /**
     * A full-length description of the application
     *
     * @default pkg.description
     */
    description: string

    /**
     * The name of the developer to include in the DHIS2 manifest, following package.json author field syntax.
     *
     * @default pkg.author
     */
    author: string

    /**
     * The minimum DHIS2 version the App supports (eg. '2.35'). Required when uploading an app to the App Hub. The app's major version in the app's package.json needs to be increased when changing this property.
     */
    minDHIS2Version?: string
    /**
     * The maximum DHIS2 version the App supports.
     */
    maxDHIS2Version?: string

    /**
     * The path to the application entrypoint (not used for libraries)
     */
    entryPoints: {
        /**
         * The path to the application entrypoint (not used for libraries)
         *
         * @default ./srt/App
         */
        app?: string
        /**
         * The path to the application's plugin entrypoint (not used for libraries)
         */
        plugin?: string
        /**
         * The path to the library entrypoint(s) (not used for applications). Supports conditional exports
         *
         * @default ./src/index
         */
        lib?: string
    }

    /**
     * By default, plugin entry points will be wrapped with logic to allow the passing of properties and resizing between the parent app and the child plugin. This logic will allow users to use the plugin inside an app when wrapped in <Plugin> component from app-runtime. If set to true, this logic will not be loaded.
     */
    skipPluginLogic: boolean

    /**
     * Gets added to the plugin_type field for this app in the /api/apps response -- an example is pluginType: 'DASHBOARD' for a plugin meant to be consumed by the Dashboard app. Must be contain only characters from the set A-Z (uppercase), 0-9, - and _; i.e., it's tested against the regex /^[A-Z0-9-_]+$/.
     */
    pluginType: string

    /**
     * The DataStore and UserDataStore namespace to reserve for this application. The reserved namespace must be suitably unique, as other apps will fail to install if they attempt to reserve the same namespace - see the webapp manifest docs
     */
    dataStoreNamespace: string

    /**
     * An array of additional datastore namespaces that should be associated with the app. For each, the user can specify the authorities required to read/write. See more in the Additional datastore namespaces section below.
     */
    additionalNamespaces: string[]

    /**
     * An array of custom authorities to create when installing the app, these do not provide security protections in the DHIS2 REST API but can be assigned to user roles and used to modify the interface displayed to a user - see the webapp manifest docs
     *
     * @example ["MY_APP_ADD_NEW", "MY_APP_UPDATE", "MY_APP_DELETE"]
     */
    customAuthorities: string[]

    /**
     * An array of Shortcuts to different sections of the app that are made available for global search through the command palette in DHIS2 (>v42)
     *
     * @example shortcuts: [{ name: 'Apps Home', url: '#/'}, { name: 'App hub', url: '#/app-hub'}]
     */
    shortcuts: Array<{
        /**
         * The name of the shortcut
         */
        name: string
        /**
         * The url of the shortcut - typically a hash url which will be appended to the application url
         */
        url: string
    }>

    /**
     * ADVANCED If true, build an app artifact to be included as a root-level core application.
     *
     * @default false
     */
    coreApp: boolean

    /**
     * ADVANCED If true, do NOT include a static BaseURL in the production app artifact. This includes the Server field in the login dialog, which is usually hidden and pre-configured in production.
     *
     * @default false
     */
    standalone: boolean

    /**
     * ADVANCED Opts into and configures PWA settings for this app. Read more about the options in the PWA docs.
     *
     * @see https://developers.dhis2.org/docs/app-platform/pwa/
     */
    pwa: Partial<{
        /**
         * If true, enables registration of a service worker to perform offline caching in both development and production builds. This is required to enable Cacheable Sections. In development mode, the service worker uses different caching strategies to facilitate development; see below. If false or not set, any service worker registered in this scope will be unregistered.
         */
        enabled: boolean

        /**
         * Contains several properties to configure offline caching by the service worker; see the definitions of the following properties below.
         */
        caching: {
            /**
             * If true, omits requests to external domains from the default app shell caching strategies. If false (default), requests to external domains will be cached in the app shell. Note that this setting does not affect the recording mode.
             */
            omitExternalRequestsFromAppShell: boolean

            /**
             * Deprecated; superceded by omitExternalRequestsFromAppShell. The new option takes precedence.
             *
             * @deprecated
             */
            omitExternalRequests: boolean

            /**
             * A list of URL patterns to omit from the default app shell caching strategies. Strings will be converted to RegExes using new RegExp(str) (with their special characters escaped) to test URLs. If a URL matches one of these patterns, that request will not be cached as part of the app shell. Note that this setting does not affect the recording mode. When choosing these URL filters, note that it is better to cache too many things than to risk not caching an important part of the app shell which could break the offline functionality of the app, so choose your filter patterns accordingly.
             */
            patternsToOmitFromAppShell: string[]

            /**
             * Similar to the above setting, except this is a list of URL patterns to omit from cacheable (recorded) sections. Requests with URLs that are filtered out from cacheable sections can still be cached in the app shell cache, unless they are filtered out from the app shell as well using the setting above. When choosing these URL filters, note that it is better to cache too many things than to risk not caching an important part of the section which could break the offline functionality of the section, so choose your filter patterns accordingly.
             */
            patternsToOmitFromCacheableSections: string[]

            /**
             * Deprecated; superceded by patternsToOmitFromAppShell. The new option takes precedence.
             *
             * @deprecated
             */
            patternsToOmit: string[]

            /**
             * A list of files that can be added to the precache manifest. Note that the service worker uses Workbox to precache all static assets that end up in the ‘build’ folder after the CRA compilation and build step during the d2-app-scripts build process. The format of this list must match the required format for Workbox precache manifests, i.e. it must include a revision hash to inform when that file needs to be updated in the precache.
             */
            additionalManifestEntries: Array<{ revision: string; url: string }>

            /**
             * A list of globs that will cause matching files to be omitted from precaching. By default, all the contents of the build folder are added to the precache to give the app the best chances of functioning completely while offline. Developers may choose to omit some of these files (for example, thousands of font or image files) if they cause cache bloat and the app can work fine without them precached.
             */
            globsToOmitFromPrecache: string[]
        }

        /**
         * Vite config options that can be merged onto the App Platform's base
         * Vite config.
         *
         * The value can be either an **Object** following Vite's `UserConfig`
         * type, which may be appropriate for a simple set of options;
         * or an **path to a file** that follows the same rules as Vite
         * configuration files, which can be useful for more complex options.
         * https://vite.dev/config/
         *
         * See the platform config docs for more detail and examples.
         */
        viteConfigExtensions?: UserConfig | string
    }>
}>
