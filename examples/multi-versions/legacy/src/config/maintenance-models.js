import store from '../store';
import { getColumnsForModelType } from '../List/columns/selectors';

export function getSideBarConfig() {
    return {
        all: {
            items: [],
        },

        categorySection: {
            items: [
                'categoryOption',
                'category',
                'categoryCombo',
                'categoryOptionCombo',
                'categoryOptionGroup',
                'categoryOptionGroupSet',
            ],
        },

        dataElementSection: {
            items: [
                'dataElement',
                'dataElementGroup',
                'dataElementGroupSet',
            ],
        },

        dataSetSection: {
            items: [
                'dataSet',
                'dataSetNotificationTemplate',
            ],
        },

        indicatorSection: {
            items: [
                'indicator',
                'indicatorType',
                'indicatorGroup',
                'indicatorGroupSet',
                'programIndicator',
                'programIndicatorGroup',
            ],
        },

        organisationUnitSection: {
            items: [
                'organisationUnit',
                'organisationUnitGroup',
                'organisationUnitGroupSet',
                'organisationUnitLevel',
            ],
        },

        programSection: {
            items: [
                'program',
                'trackedEntityAttribute',
                'trackedEntityAttributeGroup',
                'relationshipType',
                'trackedEntityType',
                'programRule',
                'programRuleVariable',
            ],
        },

        validationSection: {
            items: [
                'validationRule',
                'validationRuleGroup',
                'validationNotificationTemplate',
            ],
        },

        otherSection: {
            items: [
                'constant',
                'attribute',
                'optionSet',
                'optionGroup',
                'optionGroupSet',
                'legendSet',
                'predictor',
                'predictorGroup',
                'pushAnalysis',
                'externalMapLayer',
                'dataApprovalLevel',
                'dataApprovalWorkflow',
                'locale',
                'sqlView',
            ],
        },
    };
}

export function getSectionForType(modelType) {
    const config = getSideBarConfig();

    return Object
        .keys(config)
        .find(section => config[section] &&
            config[section].items &&
            config[section].items.indexOf(modelType) >= 0);
}

/**
 * Type details:
 *
 * - filters: Add controls for filtering the model list on these properties
 * - columns: Override the default columns in the data table
 */
const typeDetails = {
    category: {
        filters: ['dataDimensionType'],
        columns: ['displayName', 'dataDimensionType', 'publicAccess', 'lastUpdated'],
    },
    categoryCombo: {
        filters: ['dataDimensionType'],
        columns: ['displayName', 'dataDimensionType', 'publicAccess', 'lastUpdated'],
    },
    categoryOptionGroup: {
        filters: ['dataDimensionType'],
        columns: ['displayName', 'dataDimensionType', 'publicAccess', 'lastUpdated'],
    },
    categoryOptionGroupSet: {
        filters: ['dataDimensionType'],
        columns: ['displayName', 'dataDimensionType', 'publicAccess', 'lastUpdated'],
    },
    dataElement: {
        filters: ['domainType', 'valueType', 'categoryCombo'],
        columns: ['displayName', 'domainType', 'valueType', 'categoryCombo[displayName]', 'lastUpdated'],
    },
    dataElementGroupSet: {
        columns: ['displayName', 'compulsory', 'publicAccess', 'lastUpdated'],
    },
    dataSet: {
        filters: ['formType'],
        columns: ['displayName', 'formType', 'periodType', 'publicAccess', 'lastUpdated'],
    },
    dataSetNotificationTemplate: {
        columns: ['displayName', 'lastUpdated'],
    },
    indicator: {
        filters: ['indicatorType'],
        columns: ['displayName', 'indicatorType[displayName]', 'publicAccess', 'lastUpdated'],
    },
    indicatorType: {
        columns: ['displayName', 'factor', 'publicAccess', 'lastUpdated'],
    },
    indicatorGroupSet: {
        columns: ['displayName', 'compulsory', 'publicAccess', 'lastUpdated'],
    },
    organisationUnit: {
        columns: ['displayName', 'level', 'lastUpdated'],
    },
    organisationUnitGroupSet: {
        columns: ['displayName', 'compulsory', 'dataDimension', 'publicAccess', 'lastUpdated'],
    },
    trackedEntityAttribute: {
        filters: ['valueType', 'aggregationType'],
        columns: ['displayName', 'valueType', 'aggregationType', 'unique', 'confidential', 'lastUpdated'],
    },
    program: {
        columns: ['displayName', 'programType', 'publicAccess', 'lastUpdated'],
        filters: ['programType'],
    },
    programIndicator: {
        filters: ['program'],
        columns: ['displayName', 'program[displayName]', 'lastUpdated'],
    },
    programRule: {
        filters: ['program'],
        columns: ['displayName', 'program[displayName]', 'lastUpdated'],
    },
    programRuleVariable: {
        filters: ['program', 'programRuleVariableSourceType'],
        columns: ['displayName', 'program[displayName]', 'programRuleVariableSourceType', 'lastUpdated'],
    },
    programStage: {
        columns: ['displayName', 'lastUpdated'],
    },
    validationRule: {
        columns: ['displayName', 'importance', 'periodType', 'publicAccess', 'lastUpdated'],
    },
    constant: {
        columns: ['displayName', 'value', 'lastUpdated'],
    },
    attribute: {
        columns: ['displayName', 'valueType', 'mandatory', 'unique', 'publicAccess', 'lastUpdated'],
    },
    optionSet: {
        columns: ['displayName', 'valueType', 'publicAccess', 'lastUpdated'],
    },
    predictor: {
        columns: ['displayName', 'output[displayName]', 'periodType', 'lastUpdated'],
    },
    pushAnalysis: {
        columns: ['displayName', 'dashboard[displayName]', 'lastUpdated'],
    },
    externalMapLayer: {
        columns: ['displayName', 'mapLayerPosition', 'mapService', 'lastUpdated'],
    },
    dataApprovalLevel: {
        columns: [
            'displayName',
            'level',
            'orgUnitLevel',
            'categoryOptionGroupSet[displayName]',
            'publicAccess',
            'lastUpdated',
        ],
    },
    dataApprovalWorkflow: {
        columns: [
            'displayName',
            'periodType',
            'publicAccess',
            'lastUpdated',
        ],
    },
    locale: {
        columns: [
            'displayName',
            'locale',
        ],
    },
    sqlView: {
        columns: [
            'displayName',
        ],
        additionalFields: [
            'name',
            'type',
        ]
    },
};

export function getFilterFieldsForType(modelType) {
    if (typeDetails.hasOwnProperty(modelType) && typeDetails[modelType].hasOwnProperty('filters')) {
        return typeDetails[modelType].filters;
    }

    return [];
}

export function getFiltersForType(modelType) {
    if (typeDetails.hasOwnProperty(modelType) && typeDetails[modelType].hasOwnProperty('filters')) {
        return typeDetails[modelType]
            .filters
            .reduce((f, filters) => {
                f[filters] = null;
                return f;
            }, {});
    }

    return [];
}

export function getTableColumnsForType(modelType, preservePropNames = false, defaultOnly = false) {
    const defaultColumns = getDefaultTableColumnsForType(modelType, preservePropNames);
    if(defaultOnly) {
        return defaultColumns;
    }
    const userSelected = getUserSelectedTableColumnsForType(modelType, preservePropNames);
    if(!userSelected || userSelected.length < 1) {
        return defaultColumns;
    }
    return userSelected;
}

export function getDefaultTableColumnsForType(modelType, preservePropNames = false) {
    if (typeDetails.hasOwnProperty(modelType) && typeDetails[modelType].hasOwnProperty('columns')) {
        return typeDetails[modelType].columns
            .map(col => (preservePropNames ? col : col.replace(/(\w*)\[(\w*)]/, '$1___$2'))); //replaces a[b] with a__b
    }
    // Default columns:
    return ['displayName', 'publicAccess', 'lastUpdated'];
}

export function getUserSelectedTableColumnsForType(modelType, preservePropNames) {
    const cols = getColumnsForModelType(store.getState(), modelType);
    return cols.map(col => (preservePropNames ? col : col.replace(/(\w*)\[(\w*)]/, '$1___$2'))); //replaces a[b] with a__b
};

export function getDefaultFiltersForType(modelType) {
    if (typeDetails.hasOwnProperty(modelType) &&
        typeDetails[modelType].hasOwnProperty('defaultFilters') &&
        Array.isArray(typeDetails[modelType].defaultFilters)
    ) {
        return typeDetails[modelType].defaultFilters;
    }

    return [];
}

export function getAdditionalFieldsForType(modelType) {
    if (typeDetails.hasOwnProperty(modelType) && 
        typeDetails[modelType].hasOwnProperty('additionalFields')
    ) {
        return typeDetails[modelType].additionalFields;
    }
    return [];
}

export default {
    getSideBarConfig,
};
