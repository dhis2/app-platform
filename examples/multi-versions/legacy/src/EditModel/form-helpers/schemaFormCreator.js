import React from 'react';

import mapPropsStream from 'recompose/mapPropsStream';
import { identity, noop, compose } from 'lodash/fp';

import FormBuilder from 'd2-ui/lib/forms/FormBuilder.component';

import { applyRulesToFieldConfigs, getRulesForModelType } from '../form-rules';
import { createFieldConfigsFor } from './schemaFieldConfigCreator';

const convertValueUsingFieldConverter = (fieldConfigs, onChangeCallback) => (fieldName, value) => {
    const fieldConfig = fieldConfigs.find(fieldConfig => fieldConfig.name === fieldName);
    const converter = fieldConfig.beforeUpdateConverter || identity;

    return onChangeCallback(fieldName, converter(value));
};

/**
 * Create a formBuilder for a schema
 * @param source$ - An observable source, such as a store
 * @param schemaName - Schema to create configs for
 * @param fieldNames - Fields to use
 * @param shouldIncludeAttributes - Whether to include attributes
 * @param customFieldOrderName - Custom name for the "schema", useful if the same schema has multiple purposes.
 * Ie. programNotificationTemplate, which are used in program Notification and programStage notifications.
 */
// TODO: Refactor shouldIncludeAttributes magic flag to separate method `createFormWithAttributesFor`
export default function createFormFor(source$, schemaName, fieldNames, shouldIncludeAttributes, customFieldOrderName) {
    const enhance = compose(
        mapPropsStream(props$ => props$
            .combineLatest(source$, (props, model) => ({ ...props, model })),
        ),
        createFieldConfigsFor(schemaName, fieldNames, undefined, shouldIncludeAttributes, false, customFieldOrderName),
    );

    function CreatedFormBuilderForm({ fieldConfigs, model, editFieldChanged, detailsFormStatusChange = noop }) {
        const onUpdateField = convertValueUsingFieldConverter(fieldConfigs, editFieldChanged);

        const fieldConfigsAfterRules = applyRulesToFieldConfigs(
            getRulesForModelType(customFieldOrderName || schemaName),
            fieldConfigs,
            model,
        );

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
