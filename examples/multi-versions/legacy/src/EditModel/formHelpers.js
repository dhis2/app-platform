import React from 'react';

import { Observable } from 'rxjs';
import { getInstance } from 'd2/lib/d2';
import mapPropsStream from 'recompose/mapPropsStream';
import { identity, noop, compose } from 'lodash/fp';

import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';

import FormFieldsForModel from '../forms/FormFieldsForModel';
import FormFieldsManager from '../forms/FormFieldsManager';

import fieldOrderNames from '../config/field-config/field-order';
import fieldGroups from '../config/field-config/field-groups';
import fieldOverrides from '../config/field-overrides/index';

import { createFieldConfig, typeToFieldMap } from '../forms/fields';
import { applyRulesToFieldConfigs, getRulesForModelType } from './form-rules';

function getLabelText(labelText, fieldConfig = {}) {
    // Add required indicator when the field is required
    if (fieldConfig.props && fieldConfig.props.isRequired) {
        return `${labelText} (*)`;
    }
    return labelText;
}

function createAttributeFieldConfigs(d2, schemaName) {
    const modelDefinition = d2.models[schemaName];

    return Object
        .keys(modelDefinition.attributeProperties)
        .map((attributeName) => {
            const attribute = modelDefinition.attributeProperties[attributeName];
            return createFieldConfig({
                name: attribute.name,
                valueType: attribute.valueType,
                type: typeToFieldMap.get(attribute.optionSet ? 'CONSTANT' : attribute.valueType),
                required: Boolean(attribute.mandatory),
                fieldOptions: {
                    labelText: attribute.name,
                    options: attribute.optionSet ? attribute.optionSet.options.map(option => ({
                        name: option.displayName || option.name,
                        value: option.code,
                    })) : [],
                },
            }, modelDefinition, d2.models);
        });
}

// Translate the sync validator messages if there are any validators
function translateValidators(fieldConfig, d2) {
    if (fieldConfig.validators) {
        fieldConfig.validators = fieldConfig.validators
            .map(validator => ({
                ...validator,
                message: d2.i18n.getTranslation(validator.message),
            }));
    }
}

// Get the field's label with required indicator if the field is required
// Save one translated label for validation messages
function setRequiredFieldsLabelText(fieldConfig, d2) {
    fieldConfig.translatedName = d2.i18n.getTranslation(fieldConfig.props.labelText);
    fieldConfig.props.labelText = getLabelText(
        fieldConfig.translatedName,
        fieldConfig,
    );
}

/* 
 * If the modelType are grouped in field-groups.js, the step number and group/step name 
 * will be added to the fieldConfig. This string can later be used for the validating
 * step in EditModelForm.isRequiredFieldsValid to tell the user which step to find the 
 * non-valid required field.
 */
function setRequiredFieldsStepName(fieldConfig, modelType, d2) {
    // TODO: Find way to fix programNotificationTemplate sending the correct modelType
    if (fieldGroups.isGroupedFields(modelType) && modelType !== 'programNotificationTemplate') {
        const stepNo = fieldGroups.groupNoByName(fieldConfig.name, modelType);
        const stepName = fieldGroups.groupNameByStep(stepNo, modelType);
        fieldConfig.step = `${stepNo + 1}: ${d2.i18n.getTranslation(stepName)}`;
    }
}

export async function createFieldConfigForModelTypes(modelType, forcedFieldOrderNames, includeAttributes = true, customFieldOrderName) {
    const d2 = await getInstance();

    const formFieldsManager = new FormFieldsManager(new FormFieldsForModel(d2.models));
    formFieldsManager.setFieldOrder(forcedFieldOrderNames || fieldOrderNames.for(modelType));

    for (const [fieldName, overrideConfig] of fieldOverrides.for(customFieldOrderName || modelType)) {
        formFieldsManager.addFieldOverrideFor(fieldName, overrideConfig);
    }

    return formFieldsManager
        .getFormFieldsForModel({ modelDefinition: d2.models[modelType] }, customFieldOrderName)
        .map((fieldConfig) => {
            translateValidators(fieldConfig, d2);
            setRequiredFieldsStepName(fieldConfig, modelType, d2);
            setRequiredFieldsLabelText(fieldConfig, d2);
            return fieldConfig;
        })
        .concat(includeAttributes
            ? createAttributeFieldConfigs(d2, modelType)
            : []);
}

function createUniqueValidator(fieldConfig, modelDefinition, uid) {
    return function checkAgainstServer(value) {
        // Don't validate against the server when we have no value
        if (!value || !value.trim()) {
            return Promise.resolve(true);
        }

        let modelDefinitionWithFilter = modelDefinition
            .filter().on(fieldConfig.fieldOptions.referenceProperty).equals(value);

        if (uid) {
            modelDefinitionWithFilter = modelDefinitionWithFilter.filter().on('id').notEqual(uid);
        }

        return modelDefinitionWithFilter
            .list()
            .then((collection) => {
                if (collection.size !== 0) {
                    return getInstance()
                        .then(d2 => d2.i18n.getTranslation('value_not_unique'))
                        .then(message => Promise.reject(message));
                }
                return Promise.resolve(true);
            });
    };
}

export function addUniqueValidatorWhenUnique(fieldConfig, modelToEdit) {
    if (fieldConfig.unique) {
        fieldConfig.asyncValidators = [createUniqueValidator(fieldConfig, modelToEdit.modelDefinition, modelToEdit.id)];
    }

    return fieldConfig;
}

export function isAttribute(model, fieldConfig) {
    return model.attributes && new Set(Object.keys(model.attributes)).has(fieldConfig.name);
}

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

function addValuesToFieldConfigs(fieldConfigs, model) {
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
 * @param schema - Schema to create configs for
 * @param fieldNames - Fields to use
 * @param filterFieldConfigs - A filter function that should return an array of fieldConfigs (must be same amount of fieldConfigs)
 * @param includeAttributes - Whether to include attributes
 * @param runRules - Whether to apply field-rules specified in field-rules file.
 * @param customFieldOrderName - Custom name for the "schema", useful if the same schema has multiple purposes.
 * Ie. programNotificationTemplate, which are used in program Notification and programStage notifications.
 */
export function createFieldConfigsFor(schema, fieldNames, filterFieldConfigs = identity, includeAttributes, runRules = true, customFieldOrderName) {
    // eslint-disable-next-line no-param-reassign
    filterFieldConfigs = filterFieldConfigs || identity;
    return mapPropsStream(props$ => props$
        .filter(({ model }) => model)
        .combineLatest(
            Observable.fromPromise(createFieldConfigForModelTypes(schema, fieldNames, includeAttributes, customFieldOrderName)),
            (props, fieldConfigs) => {
                const fieldConfigsWithValues = addValuesToFieldConfigs(fieldConfigs, props.model);
                const fieldConfigsToUse = runRules ? applyRulesToFieldConfigs(getRulesForModelType(customFieldOrderName || schema),
                    filterFieldConfigs(fieldConfigsWithValues), props.model)
                    : fieldConfigsWithValues;
                return {
                    ...props,
                    fieldConfigs: fieldConfigsToUse,
                };
            }));
}

const convertValueUsingFieldConverter = (fieldConfigs, onChangeCallback) => (fieldName, value) => {
    const fieldConfig = fieldConfigs.find(fieldConfig => fieldConfig.name === fieldName);
    const converter = fieldConfig.beforeUpdateConverter || identity;

    return onChangeCallback(fieldName, converter(value));
};

// TODO: Refactor includeAttributes magic flag to separate method `createFormWithAttributesFor`
export function createFormFor(source$, schema, properties, includeAttributes, customFieldOrderName) {
    const enhance = compose(
        mapPropsStream(props$ => props$
            .combineLatest(source$, (props, model) => ({ ...props, model })),
        ),
        createFieldConfigsFor(schema, properties, undefined, includeAttributes, false, customFieldOrderName),
    );

    function CreatedFormBuilderForm({ fieldConfigs, model, editFieldChanged, detailsFormStatusChange = noop }) {
        const onUpdateField = convertValueUsingFieldConverter(fieldConfigs, editFieldChanged);
        const fieldConfigsAfterRules = applyRulesToFieldConfigs(getRulesForModelType(customFieldOrderName || schema), fieldConfigs, model);
        return (
            <FormBuilder
                fields={fieldConfigsAfterRules}
                onUpdateField={onUpdateField}
                onUpdateFormStatus={detailsFormStatusChange}
            />
        );
    }

    return enhance(CreatedFormBuilderForm);
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
        ? { ...fieldConfig, props: { ...fieldConfig.props, ...props } }
        : fieldConfig);
