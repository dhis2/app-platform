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

const createExpressionWithFields = (types, fields) => {
    return types.objectExpression(
        fields.map(field => {
            let value

            if (field.value.kind === 'ObjectValue') {
                value = createExpressionWithFields(types, field.value.fields)
            } else if (field.value.kind === 'ArrayValue') {
                throw new Error('@TODO(array value): Implement me!')
            } else {
                value = createLiteralForGraphqlPrimitive(types, field.value.kind, field.value.value)
            }

            return types.objectProperty(
                types.identifier(field.name.value),
                value,
            )
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

        if (type === 'ObjectExpression') {
            return types.objectProperty(
                types.identifier(name),
                types.assignmentPattern(
                    types.identifier(name),
                    createExpressionWithFields(types, defaultValue)
                ),
                false,
                true
            )
        }

        if (type === 'ArrayExpress') {
            throw new Error('@TODO(array default value): implement me!')
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
