import { Observable } from 'rxjs';
import mapPropsStream from 'recompose/mapPropsStream';
import { identity } from 'lodash/fp';

import { createFieldConfigForModelTypes } from '../formHelpers';
import { applyRulesToFieldConfigs, getRulesForModelType } from '../form-rules';
import { isAttribute } from './fieldChecks';

const transformValuesUsingConverters = (fieldConfig) => {
    if (fieldConfig.beforePassToFieldConverter) {
        return {
            ...fieldConfig,
            value: fieldConfig.beforePassToFieldConverter(fieldConfig.value),
        };
    }

    return fieldConfig;
};

const addModelToFieldConfigProps = model => fieldConfig => ({
    ...fieldConfig,
    props: { ...fieldConfig.props, model },
});

export function addValuesToFieldConfigs(fieldConfigs, model) {
    return fieldConfigs
        .map((fieldConfig) => {
            if (isAttribute(model, fieldConfig)) {
                return ({
                    ...fieldConfig,
                    value: model.attributes[fieldConfig.name],
                });
            }

            return ({
                ...fieldConfig,
                value: model[fieldConfig.name],
            });
        })
        .map(transformValuesUsingConverters)
        .map(addModelToFieldConfigProps(model));
}

/**
 * Create fieldConfigs for a schema
 * @param schemaName - Schema to create configs for
 * @param fieldNames - Fields to use
 * @param filterFieldConfigs - A filter function that should return an array of fieldConfigs (must be same amount of fieldConfigs)
 * @param shouldIncludeAttributes - Whether to include attributes
 * @param runRules - Whether to apply field-rules specified in field-rules file.
 * @param customFieldOrderName - Custom name for the "schema", useful if the same schema has multiple purposes.
 * Ie. programNotificationTemplate, which are used in program Notification and programStage notifications.
 */
export function createFieldConfigsFor(schemaName, fieldNames, filterFieldConfigs = identity, shouldIncludeAttributes, runRules = true, customFieldOrderName) {
    return mapPropsStream(props$ => props$
        .filter(({ model }) => model)
        .combineLatest(
            Observable.fromPromise(createFieldConfigForModelTypes(schemaName, fieldNames, shouldIncludeAttributes, customFieldOrderName)),
            (props, fieldConfigs) => {
                const fieldConfigsWithValues = addValuesToFieldConfigs(fieldConfigs, props.model);
                const fieldConfigsToUse = runRules
                    ? applyRulesToFieldConfigs(
                        getRulesForModelType(customFieldOrderName || schemaName),
                        filterFieldConfigs(fieldConfigsWithValues),
                        props.model,
                    )
                    : fieldConfigsWithValues;
                return {
                    ...props,
                    fieldConfigs: fieldConfigsToUse,
                };
            }));
}

/**
 * Add given props to the fieldConfig.
 * If fieldNames has values, only fields with those name will be given the props.
 * Useful to be given to map() of fieldConfigs.
 *
 * Ie: Only fields with name='shortname' will be given the props.
 * @example
 *  fieldConfigs.map(addPropsToFieldConfig[props, ['shortName']
 * @param fieldNames to add the props to.
 * @param props to add to fields
 * @returns {function(*): {props: {}}} fieldConfig with the props added.
 */
export const addPropsToFieldConfig = (props, fieldNames = []) => fieldConfig =>
    ((fieldNames.length < 1 || fieldNames.includes(fieldConfig.name))
        ? {
            ...fieldConfig,
            props: { ...fieldConfig.props, ...props },
        }
        : fieldConfig);

