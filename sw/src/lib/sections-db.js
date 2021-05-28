import { openDB } from 'idb'

export const SECTIONS_DB = 'sections-db'
export const SECTIONS_STORE = 'sections-store'

const DB_VERSION = 1

/**
 * Opens indexed DB and object store for recorded sections. Should be used any
 * time the DB is accessed to make sure object stores are set up correctly and
 * avoid DB-access race condition on first installation.
 *
 * @returns {Promise} dbPromise. Usage: `const db = await dbPromise`
 */
export function openSectionsDB() {
    return openDB(SECTIONS_DB, DB_VERSION, {
        upgrade(db, oldVersion /* newVersion, transaction */) {
            // DB versioning trick that can iteratively apply upgrades
            // https://developers.google.com/web/ilt/pwa/working-with-indexeddb#using_database_versioning
            switch (oldVersion) {
                case 0: {
                    db.createObjectStore(SECTIONS_STORE, {
                        keyPath: 'sectionId',
                    })
                }
                // falls through (this comment satisfies eslint)
                default: {
                    console.log('[sections-db] Done upgrading DB')
                }
            }
        },
    })
}
