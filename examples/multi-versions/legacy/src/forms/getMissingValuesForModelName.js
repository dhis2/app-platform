import fieldOrder from '../config/field-config/field-order';
import fieldOverrides from '../config/field-overrides/index';
import FormFieldsManager from './FormFieldsManager';
import FormFieldsForModel from './FormFieldsForModel';

/**
 * @param {Object} d2
 * @param {string} formName
 * @param {string[]} fields
 * @return {Object} Rules for the fields by name
 */
const createFieldRules = (d2, modelType, formName, fields) => {
    const modelDefinition = d2.models[modelType];
    const formFieldsManager = new FormFieldsManager(new FormFieldsForModel(d2.models));
    formFieldsManager.setFieldOrder(fields);

    for (const [fieldName, overrideConfig] of fieldOverrides.for(formName)) {
        formFieldsManager.addFieldOverrideFor(fieldName, overrideConfig);
    }

    return formFieldsManager
        .getFormFieldRulesForModel({ modelDefinition })
        .map(fieldConfig => {
            const labelTextTranslationKey = fieldConfig.fieldOptions.labelText;
            fieldConfig.labelText = d2.i18n.getTranslation(labelTextTranslationKey);
            return fieldConfig;
        })
        .reduce(addToNamedCollection, {})
    ;
};

/**
 * @param {Object} values
 * @param {string[]} fields
 * @param {Object} fieldRules
 * @return {string[]} Missing field names
 */
const getMissingFields = (values, fields, fieldRules) => fields.reduce(
    (missingFields, field) =>
        !values[field] && fieldRules[field] && fieldRules[field].required
            ? [ ...missingFields, fieldRules[field].labelText || field ]
            : missingFields,
    [],
);

/**
 * Creates an array containing all missing fields
 * for a form with required values.
 * It doesn't check if all values required to save
 * a model in the DB are give.
 *
 * @param {Object} d2
 * @param {string} modelType E. g. 'program'
 * @param {string} formName Maintenance app specific
 * @param {Object} values Populated d2 model
 * @return {string[]} Missing field names
 */
const getMissingValuesForModelName = (d2, modelType, formName, values) => {
    const fields = fieldOrder.for(formName);
    const fieldRules = createFieldRules(d2, modelType, formName, fields);
    return getMissingFields(values, fields, fieldRules);
}

/**
 * @param {Object} collection A collection to add the values to
 * @param {{ name: string;  }[]} values An array containing objects with a name property
 * @return {{ [name]: field }} A hash-map-like collection of the fields
 */
const addToNamedCollection = (collection, value) =>
    ({ ...collection, [value.name]: value });

export default getMissingValuesForModelName;
export {
    createFieldRules,
    getMissingFields,
    getMissingValuesForModelName,
}
