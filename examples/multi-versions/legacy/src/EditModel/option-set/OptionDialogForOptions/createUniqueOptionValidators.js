import { optionsForOptionSetStore } from '../stores';
import { createValidatorFromValidatorFunction } from '../../../forms/fields';
import { isFieldCode, isFieldName } from '../../form-helpers/fieldChecks';

const createUniqueValueValidator = (fieldName, modelId, allOptions) => fieldValue =>
    !allOptions.find(option =>
        // Only allow value to be identical to the value of the model that is being edited
        option[fieldName] === fieldValue && option.id !== modelId,
    );

/*
 * Since this is custom for option sets and requires stuff from the option store
 * the validator for unique fields is created here rather than in
 * forms/fields.
 */
const getValidatorForField = (state, fieldName, modelId, d2) => {
    const uniqueValueValidator = createUniqueValueValidator(fieldName, modelId, state.options);
    uniqueValueValidator.message = d2.i18n.getTranslation(`option_${fieldName}_must_be_unique`);
    return uniqueValueValidator;
};

async function addUniqueValidator(fieldConfig, modelId, d2, fieldName) {
    optionsForOptionSetStore.subscribe((state) => {
        if (!state.isLoading) {
            const uniqueValueValidator = getValidatorForField(state, fieldName, modelId, d2);

            fieldConfig.validators
                .push(createValidatorFromValidatorFunction(uniqueValueValidator));
        }
    });
}

/* Add fields that should be unique within an option here */
export default function addValidatorForUniqueField(fieldConfig, modelId, d2) {
    if (isFieldCode(fieldConfig) || isFieldName(fieldConfig)) {
        addUniqueValidator(fieldConfig, modelId, d2, fieldConfig.name);
    }
}
