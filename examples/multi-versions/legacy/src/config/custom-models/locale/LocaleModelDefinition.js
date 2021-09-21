import ModelDefinition from 'd2/lib/model/ModelDefinition';
import ModelCollection from 'd2/lib/model/ModelCollection';

let cachedLocales = null;
const resetCache = () => {
    cachedLocales = null;
};

export default class LocaleModelDefinition extends ModelDefinition {
    getLocalesAndAuthorities() {
        // Return cached results if available
        if (cachedLocales) {
            return Promise.resolve(cachedLocales);
        }

        // Otherwise fetch
        return Promise.all([
            this.api.get('locales/dbLocales'),
            this.api.get('me/authorization'),
        ]).then(([locales, authorities]) => {
            const canCreateAndDelete = authorities.some(auth => ['F_SYSTEM_SETTING', 'ALL'].includes(auth));
            const access = {
                read: true,
                update: canCreateAndDelete,
                externalize: false,
                delete: canCreateAndDelete,
                write: canCreateAndDelete,
                manage: false,
            };

            // Cache the response first time and keep using it
            cachedLocales = locales.map((locale) => {
                const model = this.create({
                    ...locale,
                    access,
                    displayName: locale.name,
                });
                return model;
            });
            return cachedLocales;
        });
    }

    get(id) {
        const promise = cachedLocales ?
            Promise.resolve(cachedLocales.find(locale => locale.id === id)) :
            this.api.get(`locales/dbLocales/${id}`);

        return promise.then(locales => locales);
    }

    list() {
        // Read the query string manually from the filters instance because we don't want to transform 
        // it to query parameters for API calls. We will do client side filtering instead. 
        const nameFilter = this.filters.filters.find(({ propertyName }) => propertyName === 'identifiable');
        const queryString = nameFilter && nameFilter.filterValue;

        return this.getLocalesAndAuthorities()
            .then((locales) => {
                const filteredLocales = locales.filter(locale =>
                    !queryString ||
                    (locale.locale.toLowerCase()).indexOf(queryString.toLowerCase()) > -1 ||
                    (locale.displayName.toLowerCase()).indexOf(queryString.toLowerCase()) > -1,
                );

                return ModelCollection.create(
                    this,
                    filteredLocales,
                    // Server does not return pager data for locales, but it can be manually created
                    {
                        page: 1,
                        pageCount: 1,
                        total: filteredLocales.length,
                        query: {
                            pageSize: filteredLocales.length,
                        },
                    },
                );
            });
    }

    save(model) {
        const { name: language, locale: country } = model;
        return this.api.post(`locales/dbLocales?country=${country}&language=${language}`)
            .then(() => {
                resetCache();

                return {
                    status: 'OK',
                };
            });
    }

    delete(model) {
        // TODO: change url to locales/dbLocales?....
        return this.api.delete(`locales/dbLocales/${model.id}`).then(() => {
            resetCache();

            return {
                status: 'OK',
            };
        });
    }
}
