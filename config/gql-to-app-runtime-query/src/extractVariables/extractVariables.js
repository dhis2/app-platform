const { getDefaultValueOfVariable } = require('./getDefaultValueOfVariable')
const { getGraphqlType } = require('./getGraphqlType')
const { getTypeOfVariable } = require('./getTypeOfVariable')

module.exports.extractVariables = definition => {
    const { variableDefinitions } = definition

    return variableDefinitions.map(variableDefinition => ({
        name: variableDefinition.variable.name.value,
        type: getTypeOfVariable(variableDefinition),
        graphqlType: getGraphqlType(variableDefinition),
        defaultValue: getDefaultValueOfVariable(variableDefinition),
        required: variableDefinition.type.kind === 'NonNullType',
    }))
}
