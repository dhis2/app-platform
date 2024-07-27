/**
 * Note that these values are different from the boilerplate files that
 * are copied when using `d2-app-scripts init` -- these are used as defaults
 * when parsing d2 config of existing apps
 *
 * The boilerplate files live in /config/init/
 */

const defaultsApp = {
    type: 'app',

    entryPoints: {
        app: './src/App.jsx',
    },
}

const defaultsLib = {
    type: 'lib',

    entryPoints: {
        lib: './src/index.jsx',
    },
}

const defaultsPWA = {
    pwa: {
        /**
         * If true, service worker is registered to perform offline caching
         * and use of cacheable sections & recording mode is enabled
         */
        enabled: false,
        caching: {
            /**
             * If true, don't cache requests to exteral domains in app shell.
             * Doesn't affect recording mode
             */
            omitExternalRequestsFromAppShell: false,
            /** Deprecated version of above */
            omitExternalRequests: false,
            /**
             * Don't cache URLs matching patterns in this array in app shell.
             * Doesn't affect recording mode
             */
            patternsToOmitFromAppShell: [],
            /** Deprecated version of above */
            patternsToOmit: [],
            /**
             * Don't cache URLs matching these patterns in recorded sections.
             * Can still be cached in app shell unless filtered there too.
             */
            patternsToOmitFromCacheableSections: [],
            /**
             * In addition to the contents of an app's 'build' folder, other
             * URLs can be precached by adding them to this list which will
             * add them to the precache manifest at build time. The format of
             * this list must match the Workbox precache list format:
             * https://developers.google.com/web/tools/workbox/modules/workbox-precaching#explanation_of_the_precache_list
             */
            additionalManifestEntries: [],
            /**
             * By default, all the contents of the `build` folder are added to
             * the precache to give the app the best chances of functioning
             * completely while offline. Developers may choose to omit some
             * of these files (for example, thousands of font or image files)
             * if they cause cache bloat and the app can work fine without
             * them precached. See LIBS-482
             *
             * The globs should be relative to the public dir of the built app.
             * Used in injectPrecacheManifest.js
             */
            globsToOmitFromPrecache: [],
        },
    },
}

module.exports = { defaultsApp, defaultsLib, defaultsPWA }
