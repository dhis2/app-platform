export default new Map([
    ['aggregationLevels', {
        referenceType: 'organisationUnitLevel',
        fieldOptions: {},
    }],
    ['categoryCombo', {
        fieldOptions: {
            queryParamFilter: ['dataDimensionType:eq:DISAGGREGATION', 'name:eq:default'],
            defaultToDefaultValue: true,
        },
    }],
]);
