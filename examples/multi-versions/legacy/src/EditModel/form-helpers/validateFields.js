import { get } from 'lodash/fp';

/* *
 * The result coming from FormBuilder validateField will contain an error message on fail and
 * a boolean true if it succeeds.
 */
const isInvalidField = validatedResult => validatedResult !== true;

const isRequiredField = field => get('isRequired', field.fieldOptions) === true;

const isDirtyField = field => field.value;

const isRequiredOrDirtyField = field => isRequiredField(field) || isDirtyField(field);

const validateField = (field, formRef, formRefStateClone) => {
    const validateResult = formRef.validateField(formRefStateClone, field.name, field.value);
    return {
        invalid: isInvalidField(validateResult),
        step: field.step,
        name: field.translatedName,
        message: validateResult,
    };
};

/* *
 * Constructs the error message to present to the snackBar.
 * Adds the step that the field can be found on (if present).
 */
const getErrorMessage = (field) => {
    const fieldStep = field.step ? `: ${field.name}. On step ${field.step}` : '';
    const errorMessage = `${field.message}${fieldStep}`;
    return errorMessage;
};

/**
 * Will first filter out all the fields that are invalid.
 * This includes fields that are:
 * - Required.
 * - Fields that are dirty.
 * Then it will validate the fields using a reference to the formBuilder.
 * Lastly it will fetch the first field with a failing validator.
 */
const getFirstInvalidField = (fieldConfigs, formRef, formRefStateClone) =>
    fieldConfigs
        .filter(fieldConfig => isRequiredOrDirtyField(fieldConfig))
        .map(fieldConfig => validateField(fieldConfig, formRef, formRefStateClone))
        .find(field => field.invalid);

/**
 * Validate checks all the fields that are required or has a invalid value in the form.
 * The validation will set the fields as invalid in the formbuilder and set
 * the new state of the form.
 *
 * If any the fields are not valid, it will create a message string
 * of the first invalid field.
 *
 * @returns {string}
 * The name and step/group of the invalid field.
 * If no invalid field, it will return an empty string.
 */
export default function getFirstInvalidFieldMessage(fieldConfigs, formRef) {
    const formRefStateClone = formRef.getStateClone();

    const firstInvalidField = getFirstInvalidField(fieldConfigs, formRef, formRefStateClone);

    if (!firstInvalidField) {
        return '';
    }
    formRef.setState(formRefStateClone);

    const errorMessage = getErrorMessage(firstInvalidField);
    return errorMessage;
}
