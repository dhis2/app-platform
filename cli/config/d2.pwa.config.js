/**
 * Default config for PWA properties in `d2.config.js`. They are kept separate
 * from other defaults so they aren't included in the `d2.config.js` created
 * when a new app is initialized with `d2 app scripts init`
 */
module.exports = {
    pwa: {
        /**
         * If true, service worker is registered to perform offline caching
         * and use of cacheable sections & recording mode is enabled
         */
        enabled: false,
        caching: {
            /**
             * If true, don't cache requests to exteral domains by default.
             * Doesn't affect recording mode
             */
            omitExternalRequests: false,
            /**
             * Don't cache URLs matching patterns in this array by default.
             * Doesn't affect recording mode
             */
            patternsToOmit: [],
            /**
             * Additional URLs to add to precache manifest. Requires versioning
             * See: https://developers.google.com/web/tools/workbox/modules/workbox-precaching#explanation_of_the_precache_list
             */
            additionalManifestEntries: [],
        },
    },
}
