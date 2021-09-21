import OrganisationUnitTreeMultiSelect from '../../forms/form-fields/orgunit-tree-multi-select';
import DataSetElementField from './data-set/DataSetElementField.component';
import DataInputPeriods from './data-set/DataInputPeriods.component';
import PeriodTypeDropDown from '../../forms/form-fields/period-type-drop-down';

export default new Map([
    ['categoryCombo', {
        referenceType: 'categoryCombo',
        fieldOptions: {
            queryParamFilter: ['dataDimensionType:eq:ATTRIBUTE', 'name:eq:default'],
            defaultToDefaultValue: true,
        },
    }],
    ['periodType', {
        component: PeriodTypeDropDown,
    }],
    ['organisationUnits', {
        component: OrganisationUnitTreeMultiSelect,
        fieldOptions: {},
    }],
    ['dataSetElements', {
        component: DataSetElementField,
    }],
    ['dataInputPeriods', {
        component: DataInputPeriods,
    }],
]);
