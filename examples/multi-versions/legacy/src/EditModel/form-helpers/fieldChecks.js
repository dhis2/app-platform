
export function isAttribute(model, fieldConfig) {
    return model.attributes &&
        new Set(Object.keys(model.attributes))
            .has(fieldConfig.name);
}

export const isFieldName = fieldConfig => fieldConfig.name === 'name';

export const isFieldCode = fieldConfig => fieldConfig.name === 'code';
