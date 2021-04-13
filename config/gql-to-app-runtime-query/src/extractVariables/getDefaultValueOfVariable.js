module.exports.getDefaultValueOfVariable = variableDefinition => {
    if (!variableDefinition.defaultValue) {
        return undefined
    }

    if ('ObjectValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.fields
    }

    if ('ArrayValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.values
    }

    return variableDefinition.defaultValue.value
}
