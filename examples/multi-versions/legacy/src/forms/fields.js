import {
    isRequired,
    isUrl,
    isNumber as isNumberValidator,
    isEmail,
} from 'd2-ui/lib/forms/Validators';
import isString from 'd2-utilizr/lib/isString';
import { getOr, isNumber } from 'lodash/fp';

import TextField from './form-fields/text-field';
import MultiSelect from './form-fields/multi-select';
import CheckBox from './form-fields/check-box';
import DropDown from './form-fields/drop-down';
import DropDownAsync from './form-fields/drop-down-async';
import DateSelect from './form-fields/date-select';
import StyleField from './form-fields/style-field';
import { constantNameConverter } from '../config/field-overrides/helpers/constantNameConverter';

export const CHECKBOX = Symbol('CHECKBOX');
export const INPUT = Symbol('INPUT');
export const SELECT = Symbol('SELECT');
export const SELECTASYNC = Symbol('SELECTASYNC');
export const MULTISELECT = Symbol('MULTISELECT');
export const TEXT = Symbol('TEXT');
export const DATE = Symbol('DATE');
export const INTEGER = Symbol('INTEGER');
export const IDENTIFIER = Symbol('IDENTIFIER');
export const URL = Symbol('URL');
export const EMAIL = Symbol('EMAIL');
export const NUMBER = Symbol('NUMBER');
export const COMPLEX = Symbol('COMPLEX');

function isIntegerValidator(value) {
    // Empty string values are correct values
    if (isString(value) && !value) {
        return true;
    }

    if (isString(value) && /\./.test(value)) {
        return false;
    }
    return Number.parseInt(value, 10) === Number.parseFloat(value);
}
isIntegerValidator.message = 'number_should_not_have_decimals';

export function createValidatorFromValidatorFunction(validatorFn) {
    return {
        validator: validatorFn,
        message: validatorFn.message,
    };
}

function addValidatorForType(type, modelValidation) {
    function maxNumber(value) {
        return Number(value) <= modelValidation.max;
    }
    maxNumber.message = 'value_not_max';

    function minNumber(value) {
        return Number(value) >= modelValidation.min;
    }
    minNumber.message = 'value_not_min';

    function maxTextOrArray(value) {
        return !value || value.length <= modelValidation.max;
    }
    maxTextOrArray.message = 'value_not_max';

    function minTextOrArray(value) {
        return !value || value.length >= modelValidation.min;
    }
    minTextOrArray.message = 'value_not_min';

    const validators = [];

    switch (type) {
        case NUMBER:
            validators.push(
                createValidatorFromValidatorFunction(isNumberValidator)
            );
            break;
        case INTEGER:
            validators.push(
                createValidatorFromValidatorFunction(isNumberValidator)
            );
            validators.push(
                createValidatorFromValidatorFunction(isIntegerValidator)
            );

            if (isNumber(modelValidation.max)) {
                validators.push(
                    createValidatorFromValidatorFunction(maxNumber)
                );
            }

            if (isNumber(modelValidation.min)) {
                validators.push(
                    createValidatorFromValidatorFunction(minNumber)
                );
            }
            break;
        case IDENTIFIER:
        case INPUT:
            if (isNumber(modelValidation.max)) {
                validators.push(
                    createValidatorFromValidatorFunction(maxTextOrArray)
                );
            }

            if (isNumber(modelValidation.min)) {
                validators.push(
                    createValidatorFromValidatorFunction(minTextOrArray)
                );
            }

            break;
        case URL:
            validators.push(createValidatorFromValidatorFunction(isUrl));
            break;
        case EMAIL:
            validators.push(createValidatorFromValidatorFunction(isEmail));
            break;
        default:
            break;
    }

    return validators;
}

export function getValidatorsFromModelValidation(
    modelValidation,
    modelDefinition
) {
    let validators = [];

    if (modelValidation.required) {
        validators.push(createValidatorFromValidatorFunction(isRequired));
    }

    if (modelDefinition) {
        validators = validators.concat(
            addValidatorForType(
                modelValidation.type,
                modelValidation,
                modelDefinition
            )
        );
    }

    return validators;
}

export function getFieldUIComponent(type, name) {
    switch (type) {
        case SELECT:
            return DropDown;
        case SELECTASYNC:
            return DropDownAsync;
        case CHECKBOX:
            return CheckBox;
        case MULTISELECT:
            return MultiSelect;
        case DATE:
            return DateSelect;

        case COMPLEX: {
            if (name === 'style') {
                return StyleField;
            }
        }
        case EMAIL:
        case INPUT:
        case IDENTIFIER:
        default:
            break;
    }
    return TextField;
}

export function createFieldConfig(
    fieldConfig,
    modelDefinition,
    models,
    customFieldOrderName
) {
    const fieldConstants = getOr(
        [],
        `modelProperties[${fieldConfig.name}].constants`,
        modelDefinition
    );
    const basicFieldConfig = {
        name: fieldConfig.name,
        component:
            fieldConfig.component ||
            getFieldUIComponent(fieldConfig.type, fieldConfig.name),
        props: Object.assign(fieldConfig.fieldOptions || {}, {
            labelText: fieldConfig.fieldOptions.labelText,
            modelDefinition,
            models,
            referenceType: fieldConfig.referenceType,
            referenceProperty: fieldConfig.name,
            isInteger: fieldConfig.type === INTEGER,
            multiLine: fieldConfig.name === 'description',
            fullWidth: true,
            translateOptions: fieldConstants && !!fieldConstants.length,
            isRequired: fieldConfig.required,
            options: (fieldConfig.fieldOptions.options || fieldConstants).map(
                constant => {
                    if (constant.name && constant.value) {
                        return {
                            text: constant.name,
                            value: constant.value,
                        };
                    }

                    return {
                        text: constantNameConverter(
                            customFieldOrderName || modelDefinition.name,
                            fieldConfig.name,
                            constant
                        ),
                        value: constant.toString(),
                    };
                }
            ),
        }),
    };

    // Checkbox fields should not be marked as required
    // This looks strange from a ui perspective as the user looks like he/she needs to check the box
    if (fieldConfig.type === CHECKBOX) {
        basicFieldConfig.props.isRequired = false;
    }

    if (fieldConfig.constants && fieldConfig.constants.length) {
        basicFieldConfig.translate = true;
    }

    const validators = []
        .concat(getValidatorsFromModelValidation(fieldConfig, modelDefinition))
        .concat(fieldConfig.validators || []);

    return Object.assign(fieldConfig, { validators }, basicFieldConfig);
}

export const typeToFieldMap = new Map([
    ['BOOLEAN', CHECKBOX],
    ['CONSTANT', SELECT],
    ['IDENTIFIER', IDENTIFIER], // TODO: Add identifiers for the type of field...
    ['REFERENCE', SELECTASYNC],
    ['TEXT', INPUT],
    ['EMAIL', EMAIL],
    ['PHONENUMBER', INPUT],
    ['COLLECTION', MULTISELECT],
    ['INTEGER', INTEGER],
    ['DATE', DATE],
    ['URL', URL],
    ['NUMBER', NUMBER],
    ['COMPLEX', COMPLEX],
    ['GEOLOCATION', INPUT],
    ['TRUE_ONLY', CHECKBOX],
]);
