import ModelDefinition from 'd2/lib/model/ModelDefinition';
import locale from './locale';

function createFromSchema({ schema, CustomModelDefinition }) {
    // Add current custom model to list of exceptions stored directly on the class
    ModelDefinition.specialClasses[schema.singular] = CustomModelDefinition;
    // A call to createFromSchema on the base class will now create an instance of the newly added specialClass
    return ModelDefinition.createFromSchema(schema);
}

export default [
    createFromSchema(locale),
];
