import React from 'react';
import PeriodTypeDropDown from '../../forms/form-fields/period-type-drop-down';
import DropDown from '../../forms/form-fields/drop-down';
import { featureTypeOverride } from './program';

const reportDateOptions = [
    {
        text: 'incident_date',
        value: 'incidentDate',
    },
    {
        text: 'enrollment_date',
        value: 'enrollmentDate',
    },
];

/**
 * The need for this component is two-fold:
 *  The API wants a string for what really should be an enum.
 *  The valid values for the STRING "reportDateToUse" is
 *  "incidentDate" and enrollmentDate".
 *
 *  The way createFieldConfig handles options-prop override for
 *  constants in fieldOptions means that we can't pass options
 *  or translateOptions through fieldOptions to the DropDown-component.
 */

const ReportDateToUseDropDown = props => (
    <DropDown {...props} options={reportDateOptions} translateOptions />
);

const NextScheduleDateField = props => {
    const dataElementsOptions = props.model.programStageDataElements
        .filter(psde => psde.dataElement.valueType === 'DATE')
        .map(psde => ({
            text: psde.dataElement.displayName,
            value: psde.dataElement,
        }));

    const selectedDEO =
        props.model.nextScheduleDate &&
        dataElementsOptions.find(
            opts => opts.value.id === props.model.nextScheduleDate.id
        );

    const value = selectedDEO && selectedDEO.value;

    return <DropDown {...props} options={dataElementsOptions} value={value} />;
};

export default new Map([
    [
        'periodType',
        {
            component: PeriodTypeDropDown,
        },
    ],
    [
        'reportDateToUse',
        {
            component: ReportDateToUseDropDown,
        },
    ],
    [
        'featureType',
        {
            fieldOptions: {
                options: featureTypeOverride,
            },
        },
    ],
    [
        'nextScheduleDate',
        {
            component: NextScheduleDateField,
        },
    ],
]);
