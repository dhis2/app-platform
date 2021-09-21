import { isEqual } from 'lodash/fp';

import {
    BEFORE_END_OF_REPORTING_PERIOD,
    AFTER_START_OF_REPORTING_PERIOD,
    EVENT_DATE,
    ENROLLMENT_DATE,
} from '../field-overrides/program-indicator/enums';

export function defaultAnalyticsPeriodBoundaries(type, current) {
    const defaultProps = {
        enrollment: [
            {
                analyticsPeriodBoundaryType: AFTER_START_OF_REPORTING_PERIOD,
                boundaryTarget: ENROLLMENT_DATE,
            },
            {
                analyticsPeriodBoundaryType: BEFORE_END_OF_REPORTING_PERIOD,
                boundaryTarget: ENROLLMENT_DATE,
            },
        ],
        event: [
            {
                analyticsPeriodBoundaryType: AFTER_START_OF_REPORTING_PERIOD,
                boundaryTarget: EVENT_DATE,
            },
            {
                analyticsPeriodBoundaryType: BEFORE_END_OF_REPORTING_PERIOD,
                boundaryTarget: EVENT_DATE,
            },
        ],
    };

    function isNotDefault(val) {
        return !isEqual(val, defaultProps.event)
            && !isEqual(val, defaultProps.enrollment);
    }

    if (current && isNotDefault(current)) {
        return current;
    }

    return defaultProps[type];
}

/**
 * Helper function to create a "default"-rule for a field, that can
 * be used in field-rules.
 * This will set the value of the field whenever the value is undefined.
 * When a value is set to no-value, it is null. Undefined only
 * occurs when it is not set at all.
 *
 * @param field Fieldname for the field to set a default value for.
 * @param defaultValue The default value for the field.
 */
export function createDefaultRuleForField(field, defaultValue) {
    return {
        field: field,
        when: [{
            operator: 'EQUALS',
            value: undefined,
        }],
        operations: [{
            type: 'CHANGE_VALUE',
            setValue: (model, fieldConfig) => {
                if (fieldConfig) {
                    fieldConfig.value = defaultValue;
                    model[fieldConfig.name] = defaultValue;
                }
            }
        }]
    }
}
