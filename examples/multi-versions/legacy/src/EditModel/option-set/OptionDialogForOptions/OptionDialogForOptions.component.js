

import { Observable } from 'rxjs';
import withStateFrom from 'd2-ui/lib/component-helpers/withStateFrom';
import { getInstance } from 'd2/lib/d2';

import AddOptionDialog from './AddOptionDialog.component';
import { createFieldConfigForModelTypes } from '../../formHelpers';
import { isAttribute, isFieldCode } from '../../form-helpers/fieldChecks';
import { optionDialogStore } from '../stores';
import modelToEditStore from '../../modelToEditStore';
import addValidatorForUniqueField from './createUniqueOptionValidators';
import { typeToFieldMap, getFieldUIComponent } from '../../../forms/fields';

const valueTypeExist = modelToEdit => typeToFieldMap.has(modelToEdit.valueType);

const addUiComponentToCodeFieldConfig = (codeFieldConfig, modelToEdit) => {
    codeFieldConfig.component = getFieldUIComponent(typeToFieldMap.get(modelToEdit.valueType));
};

const addValueTypeToCodeFieldConfig = (codeFieldConfig, modelToEdit) => {
    codeFieldConfig.type = typeToFieldMap.get(modelToEdit.valueType);
};

const addDisabledStatusToCodeFieldConfig = (codeFieldConfig, isAdd) => {
    if (isAdd) {
        codeFieldConfig.props.disabled = false;
    } else {
        codeFieldConfig.props.disabled = true;
    }
};

const handleFieldConfigForCode = (codeFieldConfig, modelToEdit, d2, isAdd) => {
    addUiComponentToCodeFieldConfig(codeFieldConfig, modelToEdit);
    addValueTypeToCodeFieldConfig(codeFieldConfig, modelToEdit);
    addDisabledStatusToCodeFieldConfig(codeFieldConfig, isAdd);
};

const addAttributeStatusToFieldConfig = (fieldConfig, model) => {
    if (isAttribute(model, fieldConfig)) {
        fieldConfig.value = model.attributes[fieldConfig.name];
    } else {
        fieldConfig.value = model[fieldConfig.name];
    }
};

async function setupFieldConfigs([modelToEdit, optionDialogState]) {
    const d2 = await getInstance();
    const fieldConfigs = await createFieldConfigForModelTypes('option');
    const isAdd = !optionDialogState.model.id;
    const model = optionDialogState.model;

    return fieldConfigs.map((fieldConfig) => {
        if (isFieldCode(fieldConfig) && valueTypeExist(modelToEdit)) {
            handleFieldConfigForCode(fieldConfig, modelToEdit, d2, isAdd);
        }
        addValidatorForUniqueField(fieldConfig, model.id, d2);
        addAttributeStatusToFieldConfig(fieldConfig, model);
        return fieldConfig;
    });
}

const optionForm$ = Observable
    .combineLatest(
        modelToEditStore, //This is the optionSet model. optionDialogStore.model contains option model
        optionDialogStore)
    .flatMap(setupFieldConfigs, ([modelToEditState, optionDialogState], fieldConfigs) => ({
        fieldConfigs,
        model: optionDialogState.model,
        isAdd: !optionDialogState.model.id,
        isDialogOpen: optionDialogState.isDialogOpen,
    }))

const optionFormData$ = optionForm$
    .flatMap(async ({ fieldConfigs, model, isAdd, ...other }) => {
        const d2 = await getInstance();
        return {
            fieldConfigs,
            model,
            isAdd,
            title: d2.i18n.getTranslation(isAdd ? 'option_add' : 'option_edit'),
            ...other,
        };
    })
    .filter(({ fieldConfigs }) => fieldConfigs.length);

export default withStateFrom(optionFormData$, AddOptionDialog);
