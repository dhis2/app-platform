import { openDB /* deleteDB */ } from 'idb'

export const BASE_URL_DB = 'dhis2-base-url-db'
export const BASE_URL_STORE = 'dhis2-base-url-store'

const DB_VERSION = 1

/**
 * Opens indexed DB and object store for baser urls by app name. Should be used any
 * time the DB is accessed to make sure object stores are set up correctly and
 * avoid DB-access race condition on first installation.
 *
 * @returns {Promise} dbPromise. Usage: `const db = await dbPromise`
 */
function openBaseUrlsDB() {
    return openDB(BASE_URL_DB, DB_VERSION, {
        upgrade(db, oldVersion /* newVersion, transaction */) {
            // DB versioning trick that can iteratively apply upgrades
            // https://developers.google.com/web/ilt/pwa/working-with-indexeddb#using_database_versioning
            switch (oldVersion) {
                case 0: {
                    db.createObjectStore(BASE_URL_STORE, {
                        keyPath: 'appName',
                    })
                }
                // falls through (this comment satisfies eslint)
                default: {
                    console.debug('[sections-db] Done upgrading DB')
                }
            }
        },
    })
}

/** Deletes the DB */
// function deleteBaseUrlsDB() {
//     return deleteDB(BASE_URL_DB)
// }

// todo: maybe this should also send a message to the service worker
// that can be handled by the next requests... but what if no requests happen?
export async function setBaseUrlByAppName({ appName, baseUrl }) {
    const db = await openBaseUrlsDB()
    return db.put(BASE_URL_STORE, { appName, baseUrl })
}

export async function getBaseUrlByAppName(appName) {
    const db = await openBaseUrlsDB()
    return db.get(BASE_URL_STORE, appName).then((entry) => entry?.baseUrl)
}
