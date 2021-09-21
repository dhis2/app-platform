import log from 'loglevel';
import camelCaseToUnderscores from 'd2-utilizr/lib/camelCaseToUnderscores';
import { every, identity } from 'lodash/fp';
import {
    typeToFieldMap,
    createFieldConfig as createFieldConfigOrig,
} from './fields';

const FIELDS_TO_IGNORE_ON_DISPLAY = ['id', 'publicAccess', 'created', 'lastUpdated', 'user', 'userGroupAccesses', 'attributeValues'];

/**
 * @param {Object} origin An obejct to be cloned with getters and setters
 * @param {...Object} assignments
 * @return {Object}
 */
const assignToClone = (original, ...assignments) =>
    Object.assign(Object.create(original), ...assignments);

/**
 * Transforms a hash-map-like collection of fields to an array 
 * where the items have the hash-map-key as name and label text
 *
 * @param {Object} modelValidations
 * @return {Object[]}
 */
const addNameToFieldConfig = modelValidations =>
    Object.keys( modelValidations )
        // needs to be cloned this way to keep getters and setters of the model
        .map(fieldName => assignToClone(
            modelValidations[fieldName],
            {
                name: fieldName,
                fieldOptions: { labelText: camelCaseToUnderscores(fieldName) },

                // @TODO: This is a horrible horrible hack that has to go... As soon as the API is fixed!
                ...(fieldName === 'orgUnitLevel' ? { persisted: true, required: true } : {}),
            },
        ))
;

/**
 * @param [string[]] fieldNamesToIgnoreOnDisplay
 * @param {{ name: string;  }} field
 * @return {boolean}
 */
const shouldFieldBeDisplayed = (fieldNamesToIgnoreOnDisplay, field) =>
    fieldNamesToIgnoreOnDisplay.indexOf(field.fieldName) === -1;

/**
 * @param {{ type: string; }} field
 * @return {boolean}
 */
const onlyUsableFieldTypes = field =>
    typeToFieldMap.get(field.type);

/**
 * @param {{ writable: boolean; }} field
 * @return {boolean}
 */
const isFieldWritable = field => field.writable;

/**
 * @param {{ persisted: boolean; }} field
 * @return {boolean}
 */
const isFieldPersisted = field => field.persisted;

/**
 * @param {Object} modelDefinition
 * @param {Object} models
 * @param {string} customFieldOrderName
 * @return {field => Object} Contains rendering info like the react component
 */
const createFieldConfig = (
  modelDefinition,
  models,
  customFieldOrderName
) => field => {
  return createFieldConfigOrig(
      field,
      modelDefinition,
      models,
      customFieldOrderName,
  )
};

/**
 * @param {Object} overrideConfig
 * @return {(field, string) => field} Will override a field with it's override rules
 */
const overrideModelValidationKey = overrideConfig =>
    (modelValidation, overrideKey) => assignToClone(
        modelValidation,
        {
            [overrideKey]: overrideKey === 'fieldOptions'
                ? { ...modelValidation[overrideKey], ...overrideConfig[overrideKey] }
                : overrideConfig[overrideKey],
        },
    );

/**
 * @param {Object} models Instance of d2.models
 * @param {} model
 * @param {Object} fieldOverrides Contains the overrideConfig for all fields that will be overridden
 * @return {Object}
 */
const mergeOverridesIntoModelValidation = (models, fieldOverrides) =>
    field => {
        const overrideConfig = fieldOverrides[field.name];
        const isOverridden = !!overrideConfig;
        const fieldType = isOverridden && overrideConfig.type
            ? overrideConfig.type
            : typeToFieldMap.get(field.type);

        const modelValidationWithOverrides = isOverridden
            ? Object.keys(overrideConfig)
                .reduce(overrideModelValidationKey(overrideConfig), field)
            : field
        ;

        return assignToClone(
            modelValidationWithOverrides,
            { type: fieldType },
        );
    }

class FormFieldsForModel {
    constructor(models, fieldNamesToIgnoreOnDisplay = FIELDS_TO_IGNORE_ON_DISPLAY) {
        if (!models) {
            log.warn('Warning: `models` passed to FormFieldsForModel is undefined, therefore async select boxes ' +
                'and references fields might not work.');
        }

        this.fieldNamesToIgnoreOnDisplay = fieldNamesToIgnoreOnDisplay;
        this.fieldOrder = [];
        this.models = models;
    }

    setDefaultFieldOrder(fieldNames) {
        this.fieldOrder = fieldNames || [];
    }

    checkForInvalidModel(model) {
        if (!(model && model.modelDefinition && model.modelDefinition.modelValidations)) {
            throw new TypeError('Passed model does not seem to adhere to the d2 model structure ' +
                '(model.modelDefinition.modelValidations is not available)');
        }
    }

    getRulesForModel(model, fieldOverrides) {
        return addNameToFieldConfig(model.modelDefinition.modelValidations)
            .filter(field => every(
                [
                    isFieldWritable(field),
                    isFieldPersisted(field),
                    shouldFieldBeDisplayed(this.fieldNamesToIgnoreOnDisplay, field),
                    onlyUsableFieldTypes(field),
                ],
                Boolean,
            ))
            .map(mergeOverridesIntoModelValidation(this.models, fieldOverrides))
        ;
    }

    getFormFieldRulesForModel(model, fieldOverrides) {
        this.checkForInvalidModel(model);

        return this
            .getRulesForModel(model, fieldOverrides)
            .filter(identity)
        ;
    }

    getFormFieldsForModel(model, fieldOverrides = {}, customFieldOrderName) {
        this.checkForInvalidModel(model);

        const rulesForModal = this.getRulesForModel(model, fieldOverrides)
        const toFieldConfig = createFieldConfig(model.modelDefinition, this.models, customFieldOrderName)
        const fieldInstances = rulesForModal.map(toFieldConfig)
        const fieldInstancesFiltered = fieldInstances.filter(identity)

        if (!this.fieldOrder || !this.fieldOrder.length) {
            return fieldInstancesFiltered;
        }

        return fieldInstancesFiltered 
            .filter(field => this.fieldOrder.indexOf(field.name) !== -1)
            .sort((left, right) => this.fieldOrder.indexOf(left.name) > this.fieldOrder.indexOf(right.name) ? 1 : -1)
        ;
    }
}

export default FormFieldsForModel;
