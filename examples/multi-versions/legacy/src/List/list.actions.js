import Action from 'd2-ui/lib/action/Action';
import { Observable } from 'rxjs';
import log from 'loglevel';

import { getInstance } from 'd2/lib/d2';

import listStore from './list.store';
import detailsStore from './details.store';
import appState from '../App/appStateStore';
import { goToRoute } from '../router-utils';
import {
    getDefaultFiltersForType,
    getFilterFieldsForType,
    getTableColumnsForType,
    getAdditionalFieldsForType
} from '../config/maintenance-models';

export const fieldFilteringForQuery = [
    'displayName', 'shortName', 'id', 'lastUpdated', 'created', 'displayDescription',
    'code', 'publicAccess', 'access', 'href', 'level',
].join(',');

//Set over schemas that should not filter out name=default
const schemasThatShouldHaveDefaultInTheList = new Set([
    'categoryOptionCombo',
]);

const listActions = Action.createActionsFromNames([
    'loadList',
    'setListSource',
    'searchByName',
    'setFilterValue',
    'getNextPage',
    'getPreviousPage',
    'hideDetailsBox',
]);

/**
 * Filters the modelDefinition on displayname, shortName, id and code
 * Identifiable is a special field to combine the search of identifiers,
 * so it's possible to use it with conjunction of other filters.
 * @param searchString to filter on
 * @param modelDefinition to filter
 * @returns {ModelDefinition} the modelDefinition with applied filters.
 */
function applySearchByIdentifiersFilter(searchString, modelDefinition) {
    return modelDefinition.filter().on('identifiable').operator('token', searchString) 
}

function applySearchByNameFilter(searchString, modelDefinition) {
    return modelDefinition.filter().on('displayName').ilike(listStore.state.searchString)
}

// Apply current property and name filters
function applyCurrentFilters(modelDefinitions, modelName) {
    const modelDefinition = modelDefinitions[modelName];
    if (listStore.state) {
        const filterModelDefinition = Object.keys(listStore.state.filters || {})
            // Remove empty filters
            .filter(prop => listStore.state.filters[prop])
            // Only include filters that apply to the current model type
            .filter(prop => getFilterFieldsForType(modelDefinition.name).includes(prop))
            // Apply each filter to the model definition
            .map(key => [modelDefinitions.hasOwnProperty(key) ? `${key}.id` : key, listStore.state.filters[key]])
            // Add the default filters for the modelType
            .concat(getDefaultFiltersForType(modelName))
            .reduce((out, [filterField, filter]) => {
                const filterValue = filter.id || filter;
                return out.filter().on(filterField).equals(filterValue);
            }, modelDefinition);
        const searchString = listStore.state.searchString.trim();

        return searchString.length > 0
            ? applySearchByIdentifiersFilter(searchString, filterModelDefinition)
            : filterModelDefinition;
    }

    return modelDefinition;
}

function getSchemaWithFilters(modelDefinitions, modelName) {
    if (!schemasThatShouldHaveDefaultInTheList.has(modelName)) {
        return applyCurrentFilters(modelDefinitions, modelName).filter().on('name').notEqual('default');
    }
    return applyCurrentFilters(modelDefinitions, modelName);
}

function getOrderingForSchema(modelName) {
    const customOrdering = {
        dataApprovalLevel: 'level:ASC,displayName:ASC',
    };

    if (Object.keys(customOrdering).includes(modelName)) {
        return customOrdering[modelName];
    }

    return 'displayName:ASC';
}

export function getQueryForSchema(modelName) {
    return {
        fields: [
            fieldFilteringForQuery,
            getTableColumnsForType(modelName, true),
            getAdditionalFieldsForType(modelName),
        ].join(),
        order: getOrderingForSchema(modelName),
    };
}

listActions.setListSource.subscribe((action) => {
    listStore.listSourceSubject.next(Observable.of(action.data));
});

// ~
// ~ Load object list except for Organisation Units (see OrganisationUnitList.component.js)
// ~
listActions.loadList
    .filter(({ data }) => data !== 'organisationUnit')
    .combineLatest(Observable.fromPromise(getInstance()), (action, d2) => ({ ...action, d2 }))
    .flatMap(({ data: modelName, complete, error, d2 }) => {
        //Remember the searchString if its the same model
        const searchString = listStore.state && listStore.state.modelType
            && listStore.state.modelType === modelName ?
                listStore.state.searchString : '';

        listStore.setState(Object.assign(listStore.state || {}, { searchString }));
        return Observable.of({
            schema: d2.models[modelName],
            query: getQueryForSchema(modelName),
            complete,
            error,
            d2,
        });
    })
    .subscribe(async ({ schema, query, complete, error, d2 }) => {
        if (schema) {
            const listResultsCollection = await getSchemaWithFilters(d2.models, schema.name)
                .list(Object.assign(query, getQueryForSchema(schema.name)));
    
            listActions.setListSource(listResultsCollection);
            complete(`${schema.name} list loading`);
        } else {
            // If schema is not available it is not possible to fetch a list
            // and we redirect to the main list page. 
            // This is likely to happen if an invalid URL is entered in the address bar.
            goToRoute('list/all');
            complete('Schema not found');
        }
    }, log.error.bind(log));


// ~
// ~ Filter current OrganisationUnit list by name
// ~
listActions.searchByName
    .filter(({ data }) => data.modelType === 'organisationUnit')
    .subscribe(async ({ data, complete, error }) => {
        const d2 = await getInstance();
        let organisationUnitModelDefinition = d2.models.organisationUnits;

        // When an organisation unit is present on the appState we constrain the query to the children of the
        // selected organisation unit.
        if (appState.state && appState.state.selectedOrganisationUnit) {
            organisationUnitModelDefinition = organisationUnitModelDefinition
                .filter().on('parent.id').equals(appState.state.selectedOrganisationUnit.id);
        }
        const organisationUnitsThatMatchQuery = await organisationUnitModelDefinition
            .list(Object.assign(getQueryForSchema(data.modelType), {
                query: data.searchString,
                withinUserHierarchy: true,
            }));

        listActions.setListSource(organisationUnitsThatMatchQuery);
        complete();
    }, log.error.bind(log));

const nonDefaultSearchSchemas = new Set(['organisationUnit']);

// ~
// ~ Filter current list by name (except OrganisationUnit - see above)
// ~
listActions.searchByName
    .filter(({ data }) => !nonDefaultSearchSchemas.has(data.modelType))
    .subscribe(async ({ data, complete, error }) => {
        const d2 = await getInstance();

        if (!d2.models[data.modelType]) {
            error(`${data.modelType} is not a valid schema name`);
        }

        if (data.searchString) {
            listStore.setState(Object.assign(listStore.state, { searchString: data.searchString }));
        } else {
            listStore.setState(Object.assign(listStore.state, { searchString: '' }));
        }

        const searchResultsCollection = await getSchemaWithFilters(d2.models, data.modelType)
            .list(getQueryForSchema(data.modelType));

        listActions.setListSource(searchResultsCollection);

        complete(`${data.modelType} list with search on 'displayName' for '${data.searchString}' is loading`);
    }, log.error.bind(log));

// ~
// ~ Filter current list by property
// ~
listActions.setFilterValue
    .subscribe(async ({ data, complete, error }) => {
        const d2 = await getInstance();

        if (!d2.models[data.modelType]) {
            error(`${data.modelType} is not a valid schema name`);
        }

        const filterField = d2.models.hasOwnProperty(data.filterField) ? `${data.filterField}.id` : data.filterField;
        const filterValue = (!!data.filterValue && !!data.filterValue.hasOwnProperty('id'))
            ? data.filterValue.id
            : data.filterValue;

        if (filterField && filterValue) {
            listStore.setState(Object.assign(listStore.state, {
                filters: Object.assign(listStore.state.filters, { [data.filterField]: data.filterValue }),
            }));
        } else {
            listStore.setState(Object.assign(listStore.state, {
                filters: Object.assign(listStore.state.filters, { [data.filterField]: null }),
            }));
        }

        const searchResultsCollection = await getSchemaWithFilters(d2.models, data.modelType)
            .list(getQueryForSchema(data.modelType));

        listActions.setListSource(searchResultsCollection);

        complete(`${data.modelType} list with filter on '${filterField}' for '${filterValue}' is loading`);
    }, log.error.bind(log));

// TODO: For simple action mapping like this we should be able to do something less boiler plate like
listActions.getNextPage.subscribe(() => {
    listStore.getNextPage();
});

listActions.getPreviousPage.subscribe(() => {
    listStore.getPreviousPage();
});

listActions.hideDetailsBox.subscribe(() => {
    detailsStore.setState(null);
});

export default listActions;
