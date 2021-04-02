const { extractResources } = require('../extractResources')
const { extractVariables } = require('../extractVariables')
const { resourceToObjectProperty } = require('../resourceToObjectProperty')
const {
    validateVariableDefaultValues,
} = require('../validateVariableDefaultValues')

module.exports.handleQuery = (types, path, definition) => {
    const variables = extractVariables(definition)
    validateVariableDefaultValues(variables)

    const resources = extractResources(definition)

    const resourcesObjectExpressions = resources.map(resource =>
        resourceToObjectProperty({
            variables,
            resource,
            types,
        })
    )

    path.replaceWith(types.objectExpression(resourcesObjectExpressions))
}
