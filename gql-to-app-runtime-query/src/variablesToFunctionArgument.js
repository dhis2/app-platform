const createLiteralForGraphqlPrimitive = (types, type, value) => {
    if (type === 'StringLiteral') {
        return types.stringLiteral(value)
    }

    if (type === 'NumberLiteral') {
        return types.numericLiteral(Number(value))
    }

    if (type === 'Boolean') {
        return types.booleanLiteral(value === 'true' ? true : false)
    }

    throw new Error(`Can't create literal for type "${type}". Not supported`)
}

const createExpressionWithFields = (types, type, fields) => {
    return types.objectExpression(
        fields.map(field => {
            console.log('field', field)
        })
    )
}

module.exports.variablesToFunctionArgument = ({ types, variables }) => {
    const fields = variables.map(variable => {
        const { name, defaultValue, type } = variable
        if (!defaultValue) {
            return types.objectProperty(
                types.identifier(name),
                types.identifier(name),
                false,
                true
            )
        }

        if (type === 'Object') {
            return types.objectProperty(
                types.identifier(name),
                types.assignmentPattern(
                    types.identifier(name),
                    createExpressionWithFields(types, type, defaultValue)
                ),
                false,
                true
            )
        }

        if (type === 'Array') {
            return
        }

        return types.objectProperty(
            types.identifier(name),
            types.assignmentPattern(
                types.identifier(name),
                createLiteralForGraphqlPrimitive(types, type, defaultValue)
            ),
            false,
            true
        )
    })

    return types.objectPattern(fields.filter(i => i))
}
