import i18n from '@dhis2/d2-i18n'

/**
 * @typedef {string[][]} Permissions
 */

/**
 * @typedef {Object} Section
 * @property {string} path
 * @property {string} [name]
 * @property {string} [description]
 * @property {string} [schemaName]
 *
 * @property {Permissions} [permissions]
 * These are static and are not retrievable from the api
 * In the old maintenance app, they're defined statically
 * on a custom model definition
 *
 * @property {boolean} [hideInCardMenu]
 * @property {boolean} [hideInSideBar]
 */

/**
 * @typedef {Object.<string, Section>} Sections
 */

/**
 * @type Sections
 */
export const categorySections = {
    categoryOption: {
        name: 'Category option',
        path: '/list/categorySection/categoryOption',
        description: i18n.t(
            'Create, modify, view and delete data element category options. Category options are options with in category.'
        ),
        schemaName: 'categoryOptions',
    },
    category: {
        name: 'Category',
        path: '/list/categorySection/category',
        description: i18n.t(
            'Create, modify, view and delete data element categories. Categories are used for disaggregation of data elements.'
        ),
        schemaName: 'categories',
    },
    categoryCombo: {
        name: 'Category combination',
        path: '/list/categorySection/categoryCombo',
        description: i18n.t(
            'msgid "Create, modify, view and delete data element category combinations.'
        ),
        schemaName: 'categoryCombos',
    },
    categoryOptionCombo: {
        name: 'Category option combination',
        path: '/list/categorySection/categoryOptionCombo',
        description: i18n.t(
            'View and edit data element category option combinations. Category option combinations are break-downs of category.'
        ),
        schemaName: 'categoryOptionCombos',
    },
    categoryOptionGroup: {
        name: 'Category option group',
        path: '/list/categorySection/categoryOptionGroup',
        description: i18n.t(
            'Create, modify, view and delete category option groups, which can be used to classify category options.'
        ),
        schemaName: 'categoryOptionGroups',
    },
    categoryOptionGroupSet: {
        name: 'Category option group set',
        path: '/list/categorySection/categoryOptionGroupSet',
        description: i18n.t(
            'Create, modify, view and delete category option group sets, which can be used for improved data analysis.'
        ),
        schemaName: 'categoryOptionGroupSets',
    },
}

export const dataElementSections = {
    dataElement: {
        name: 'Data elements',
        path: '/list/dataElementSection/dataElement',
        description: i18n.t(
            'Create, modify, view and delete data elements. Data elements are phenomena for which will be captured and analyzed.'
        ),
        schemaName: 'dataElements',
    },
    dataElementGroup: {
        name: 'Data element group',
        path: '/list/dataElementSection/dataElementGroup',
        description: i18n.t(
            'Create, modify, view and delete data element groups. Groups are used for improved analysis.'
        ),
        schemaName: 'dataElementGroups',
    },
    dataElementGroupSet: {
        name: 'Data element group set',
        path: '/list/dataElementSection/dataElementGroupSet',
        description: i18n.t(
            'Create, modify, view and delete data element group sets. Group sets are used for improved analysis.'
        ),
        schemaName: 'dataElementGroupSets',
    },
}

export const dataSetSections = {
    dataSet: {
        name: 'Data set',
        path: '/list/dataSetSection/dataSet',
        description: i18n.t(
            'Create, update, view and delete data sets and custom forms. A data set is a collection of data elements for which data is entered.'
        ),
        schemaName: 'dataSets',
    },
    dataSetNotification: {
        name: 'Data set notifications',
        path: '/list/dataSetSection/dataSetNotificationTemplate',
        description: i18n.t(
            'Create, update, view, and delete data set notifications.'
        ),
        schemaName: 'dataSetNotificationTemplates',
    },
}

export const indicatorSections = {
    indicator: {
        name: 'Indicator',
        path: '/list/indicatorSection/indicator',
        description: i18n.t(
            'Create, modify, view and delete indicators. An indicator is a formula consisting of data elements and numbers.'
        ),
        schemaName: 'indicators',
    },
    indicatorType: {
        name: 'Indicator type',
        path: '/list/indicatorSection/indicatorType',
        description: i18n.t(
            'Create, modify, view and delete indicator types. An indicator type is a factor for an indicator, like percentage.'
        ),
        schemaName: 'indicatorTypes',
    },
    indicatorGroup: {
        name: 'Indicator group',
        path: '/list/indicatorSection/indicatorGroup',
        description: i18n.t(
            'Create, modify, view and delete indicator groups. Groups are used for improved analysis.'
        ),
        schemaName: 'indicatorGroups',
    },
    indicatorGroupSet: {
        name: 'Indicator group set',
        path: '/list/indicatorSection/indicatorGroupSet',
        description: i18n.t(
            'Create, modify, view and delete indicator group sets. Group sets are used for improved analysis.'
        ),
        schemaName: 'indicatorGroupSets',
    },
    programIndicator: {
        name: 'Program indicator',
        path: '/list/indicatorSection/programIndicator',
        description: i18n.t(
            'Expressions based on data elements and attributes of tracked entities. You use program indicators to calculate values based on a formula.'
        ),
        schemaName: 'programIndicators',
    },
    programIndicatorGroup: {
        name: 'Program indicator group',
        path: '/list/indicatorSection/programIndicatorGroup',
        description: i18n.t('Group program indicators, even across programs.'),
        schemaName: 'programIndicatorGroups',
    },
}

export const organisationUnitSections = {
    organisationUnit: {
        name: 'Organisation unit',
        path: '/list/organisationUnitSection/organisationUnit',
        description: i18n.t(
            'Create, modify, view and delete organisation units, which can be departments, offices, hospitals and clinics.'
        ),
        schemaName: 'organisationUnits',
    },
    organisationUnitGroup: {
        name: 'Organisation unit group',
        path: '/list/organisationUnitSection/organisationUnitGroup',
        description: i18n.t(
            'Create, modify, view and delete organisation unit groups. Groups are used for improved analysis.'
        ),
        schemaName: 'organisationUnitGroups',
    },
    organisationUnitGroupSet: {
        name: 'Organisation unit group set',
        path: '/list/organisationUnitSection/organisationUnitGroupSet',
        description: i18n.t(
            'Create, modify, view and delete organisation unit group sets. Group sets are used for improved analysis.'
        ),
        schemaName: 'organisationUnitGroupSets',
    },
    organisationUnitLevel: {
        name: 'Organisation unit level',
        path: '/list/organisationUnitSection/organisationUnitLevel',
        description: i18n.t(
            'Create, modify, view and delete descriptive names for the organisation unit levels in the system.'
        ),
        schemaName: 'organisationUnitLevels',
    },
    hierarchyOperations: {
        name: 'Hierarchy operations',
        path: '/list/organisationUnitSection/hierarchy',
        description: i18n.t(''),
        hideInCardMenu: true,
        permissions: [['F_ORGANISATIONUNIT_MOVE']],
    },
}

export const programSections = {
    program: {
        name: 'Program',
        path: '/list/programSection/program',
        description: i18n.t(
            '"Create modify and view programs. A program has program stages and defines which actions should be taken at each stage.'
        ),
        schemaName: 'programs',
    },
    trackedEntityAttribute: {
        name: 'Tracked entity attribute',
        path: '/list/programSection/trackedEntityAttribute',
        description: i18n.t(
            'Create, modify and view program attributes. A program can have any number of attributes.'
        ),
        schemaName: 'trackedEntityAttributes',
    },
    trackedEntityType: {
        name: 'Tracked entity type',
        path: '/list/programSection/trackedEntityType',
        description: i18n.t(
            'Define types of entities which can be tracked through the system, which can be anything from persons to commodities.'
        ),
        schemaName: 'trackedEntityTypes',
    },
    relationshipType: {
        name: 'Relationship type',
        path: '/list/programSection/relationshipType',
        description: i18n.t(
            'Create, modify and view relationship types. A relationship is typically wife and husband or mother and child.'
        ),
        schemaName: 'relationshipTypes',
    },
    programRule: {
        name: 'Program rule',
        path: '/list/programSection/programRule',
        description: i18n.t(
            'Program rules allow you to create and control dynamic behavior of the user interface in the Tracker Capture and Event Capture apps.'
        ),
        schemaName: 'programRules',
    },
    programRuleVariable: {
        name: 'Program rule variable',
        path: '/list/programSection/programRuleVariable',
        description: i18n.t(
            'Variables you use to create program rule expressions.'
        ),
        schemaName: 'programRuleVariables',
    },
}

export const validationSections = {
    validationRule: {
        name: 'Validation rule',
        path: '/list/validationSection/validationRule',
        description: i18n.t(
            'Add, modify, view and delete validation rules. Anomalies can be discovered by running validation rules against the data.'
        ),
        schemaName: 'validationRules',
    },
    validationRuleGroup: {
        name: 'Validation rule group',
        path: '/list/validationSection/validationRuleGroup',
        description: i18n.t(
            'Add, modify, view and delete validation rule groups. Provides the ability to group and run validation rules together.'
        ),
        schemaName: 'validationRuleGroups',
    },
    validationNotification: {
        name: 'Validation notification',
        path: '/list/validationSection/validationNotification',
        description: i18n.t(
            'Sends a notification when a validation rule failed'
        ),
        schemaName: 'validationNotificationTemplates',
    },
}

export const otherSections = {
    constant: {
        name: 'Constant',
        path: '/list/otherSection/constant',
        description: i18n.t(
            'Create constants which can be included in expressions of indicator and validation rules.'
        ),
        schemaName: 'constants',
    },
    attribute: {
        name: 'Attribute',
        path: '/list/otherSection/attribute',
        description: i18n.t('Create, modify and view attributes.'),
        schemaName: 'attributes',
    },
    optionSet: {
        name: 'Option set',
        path: '/list/otherSection/optionSet',
        description: i18n.t(
            'Create option sets which can be included in data elements and produce drop-down lists in data entry forms.'
        ),
        schemaName: 'optionSets',
    },
    optionGroup: {
        name: 'Option group',
        path: '/list/otherSection/optionGroup',
        description: i18n.t(
            'Create a group of options from option sets that has a similar functional area or meaning.'
        ),
        schemaName: 'optionGroups',
    },
    optionGroupSet: {
        name: 'Option group set',
        path: '/list/otherSection/optionGroupSet',
        description: i18n.t('Create, modify and view sets of option groups.'),
        schemaName: 'optionGroupSets',
    },
    legend: {
        name: 'Legend',
        path: '/list/otherSection/legend',
        description: i18n.t(
            'Create, modify and view predefined legends for maps and other visualisations.'
        ),
        schemaName: 'legends',
    },
    predictor: {
        name: 'Predictor',
        path: '/list/otherSection/predictor',
        description: i18n.t(
            'Create predictors which can be used to predict future data values.'
        ),
        schemaName: 'predictors',
    },
    predictorGroup: {
        name: 'Predictor group',
        path: '/list/otherSection/predictorGroup',
        description: i18n.t(
            'Create predictors groups that contain serveral predictors related predictors.'
        ),
        schemaName: 'predictorGroups',
    },
    pushAnalysis: {
        name: 'Push analysis',
        path: '/list/otherSection/pushAnalysis',
        description: i18n.t(
            'Manage analytics to be emailed to specific user groups on a daily, weekly or monthly basis.'
        ),
        schemaName: 'pushAnalysis',
    },
    externalMapLayer: {
        name: 'External map layer',
        path: '/list/otherSection/externalMapLayer',
        description: i18n.t('Configure external map layers for use in GIS.'),
        schemaName: 'externalMapLayers',
    },
    dataApprovalLevel: {
        name: 'Data approval level',
        path: '/list/otherSection/dataApprovalLevel',
        description: i18n.t(
            'Configure data approval levels for use in data approval workflows'
        ),
        schemaName: 'dataApprovalLevels',
    },
    dataApprovalWorkflow: {
        name: 'Data approval workflow',
        path: '/list/otherSection/dataApprovalWorkflow',
        description: i18n.t(''),
        schemaName: 'dataApprovalWorkflows',
    },
    locale: {
        name: 'Locale',
        path: '/list/otherSection/locale',
        description: i18n.t(
            'Create and manage locales for database content. A locale is a combination of language and country.'
        ),
        permissions: [['F_SYSTEM_SETTING']],
    },
    sqlView: {
        name: 'SQL View',
        path: '/list/otherSection/sqlView',
        description: i18n.t(
            'Create SQL database views. These views will typically use the resource tables to provide convenient views for third-party tools.'
        ),
        schemaName: 'sqlViews',
    },
}

export const groupEditorSection = {
    path: '/group-editor',
    permissions: [
        ['F_DATAELEMENT_PUBLIC_ADD'],
        ['F_DATAELEMENT_PRIVATE_ADD'],
        ['F_INDICATORGROUP_PUBLIC_ADD'],
        ['F_INDICATORGROUP_PRIVATE_ADD'],
    ],
}
