module.exports.getDefaultValueOfVariable = variableDefinition => {
    if (!variableDefinition.defaultValue) return undefined

    if ('ObjectExpression' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.fields
    }

    if ('ArrayExpression' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.values
    }

    return variableDefinition.defaultValue.value
}
