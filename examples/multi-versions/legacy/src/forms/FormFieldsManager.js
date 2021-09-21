class FormFieldsManager {
    constructor(fieldsForModelService) {
        this.fieldsForModelService = fieldsForModelService;
        this.fieldOverrides = {};
        this.headerFields = [];
    }

    getFormFieldRulesForModel(model) {
        return this.fieldsForModelService.getFormFieldRulesForModel(
            model,
            this.fieldOverrides,
        );
    }

    getFormFieldsForModel(model, customFieldOrderName) {
        return this.fieldsForModelService.getFormFieldsForModel(model, this.fieldOverrides, customFieldOrderName);
    }

    setFieldOrder(fieldNames) {
        this.fieldsForModelService.setDefaultFieldOrder(fieldNames);
        return this;
    }

    getHeaderFieldsForModel(model) {
        return this.getFormFieldsForModel(model)
            .filter(fieldConfig => this.headerFields.indexOf(fieldConfig.key) !== -1);
    }

    getNonHeaderFieldsForModel(model) {
        return this.getFormFieldsForModel(model)
            .filter(fieldConfig => this.headerFields.indexOf(fieldConfig.key) === -1);
    }

    setHeaderFields(fieldNames) {
        this.headerFields = Array.from(new Set(fieldNames));
        return this;
    }

    addFieldOverrideFor(fieldName, fieldConfig) {
        this.fieldOverrides[fieldName] = fieldConfig;
        return this;
    }
}

export default FormFieldsManager;
