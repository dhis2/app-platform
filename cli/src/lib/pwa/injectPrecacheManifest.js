/**
 * Compiles and assembles a manifest of files/urls to precache using Workbox.
 * Since the service worker file lives in the app shell, it will get compiled
 * using the CRA webpack config and added to the shell's `build` directory,
 * where it should be targeted by this `injectPrecacheManifest` function.
 *
 * `injectManifest` from `workbox-build` is used to generate a manifest and
 * inject it into a service worker by using string replacement; see the
 * `injectionPoint` option below. The CRA webpack config does the same thing,
 * using the `self.__WB_MANIFEST` injection point, but it's only configured to
 * add files handled by the webpack compilation process. This script handles
 * all the other files in the app's `build` dir.
 *
 * See also:
 * https://developers.google.com/web/tools/workbox/modules/workbox-build#injectmanifest_mode
 * https://developers.google.com/web/tools/workbox/modules/workbox-precaching
 */

const { reporter } = require('@dhis2/cli-helpers-engine')
const { injectManifest } = require('workbox-build')

function logManifestOutput({ count, filePaths, size, warnings }) {
    reporter.debug('The service worker precache manifest was written to:')
    filePaths.forEach((filePath) => reporter.debug(' * ', filePath))
    reporter.debug(
        `The service worker will precache ${count} URLs, totaling ${size} bytes.`
    )
    warnings.forEach(reporter.warn)
}

/**
 * Adds a precache manifest to a service worker at a location specified by
 * `swPath`. `globDirectory` should point to the directory that contains static
 * assets to be added to the precache manifest. The rest of the properties of
 * the argument object are added as options to the `injectManifest` call from
 * `workbox-build`.
 */
module.exports = function injectPrecacheManifest(paths, config) {
    // See https://developers.google.com/web/tools/workbox/reference-docs/latest/module-workbox-build#.injectManifest
    const injectManifestOptions = {
        swSrc: paths.shellBuildServiceWorker,
        swDest: paths.shellBuildServiceWorker,
        globDirectory: paths.shellBuildOutput,
        globPatterns: ['**/*'],
        // Skip index.html and `static` directory;
        // CRA's workbox-webpack-plugin handles it smartly
        globIgnores: ['static/**/*', 'index.html'],
        additionalManifestEntries: config.pwa.caching.additionalManifestEntries,
        injectionPoint: 'self.__WB_BUILD_MANIFEST',
        // Skip revision hashing for files with hash or semver in name:
        // (see https://regex101.com/r/z4Hy9k/1/ for RegEx details)
        dontCacheBustURLsMatching: /\.[a-z0-9]{8}\.|\d+\.\d+\.\d+/,
    }

    return injectManifest(injectManifestOptions).then(logManifestOutput)
}
