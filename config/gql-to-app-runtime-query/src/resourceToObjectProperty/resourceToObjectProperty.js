const { variablesToFunctionArgument } = require('./variablesToFunctionArgument')

const pipe = (...fns) => (...args) => {
    if (!fns.length) return
    return fns.slice(1).reduce((acc, fn) => fn(acc), fns[0](...args))
}

const identity = value => value

const idArgToValue = (types, idArg) => {
    if (!idArg) return

    if (idArg.value.kind === 'Variable') {
        return types.arrowFunctionExpression(
            [
                types.objectPattern([
                    types.objectProperty(
                        types.identifier('id'),
                        types.identifier('id'),
                        false,
                        true
                    ),
                ]),
            ],
            types.identifier('id')
        )
    } else if (idArg.value.kind === 'StringValue') {
        return types.objectExpression([
            types.objectProperty(
                types.identifier('id'),
                types.stringLiteral(idArg.value.value)
            ),
        ])
    }

    throw new Error(
        `The value of "id" property of "${name}" can be of type "Variable" or "StringValue", but received "${idArg.value.kind}"`
    )
}

const transformSpecialFields = field => {
    if (field === '__all') return '*'
    return field
}

const getFirstLevelFields = pipe(
    curFields => curFields.filter(field => !(field instanceof Object)),
    curFields => curFields.map(transformSpecialFields)
)

const getNestedLevelFields = curFields =>
    curFields.filter(field => field instanceof Object)

const transformNestedFields = fields =>
    fields.map(field => {
        const [[namespace, subFields]] = Object.entries(field)
        const firstLevelFields = getFirstLevelFields(subFields)
        const secondLevelFields = getNestedLevelFields(subFields)

        if (secondLevelFields.length && firstLevelFields.length) {
            return `${namespace}[${firstLevelFields.join(
                ','
            )},${transformNestedFields(secondLevelFields)}]`
        }

        if (secondLevelFields.length) {
            return `${namespace}[${transformNestedFields(secondLevelFields)}]`
        }

        return `${namespace}[${firstLevelFields.join(',')}]`
    })

const createFieldsObjectProperty = (types, fields) => {
    const firstLevelFields = getFirstLevelFields(fields)
    const nestedFields = pipe(
        getNestedLevelFields,
        transformNestedFields
    )(fields)
    const allFields = [...firstLevelFields, nestedFields]
        .filter(identity)
        .join(',')
    return types.objectProperty(
        types.identifier('fields'),
        types.stringLiteral(allFields)
    )
}

const createValuesFromItem = (types, item) => {
    if (item.kind === 'Variable') {
        return types.identifier(item.name.value)
    }

    if (item.kind === 'StringValue') {
        return types.stringLiteral(item.value)
    }

    if (item.kind === 'IntValue') {
        return types.numericLiteral(parseInt(item.value, 10))
    }

    if (item.kind === 'FloatValue') {
        return types.numericLiteral(parseFloat(item.value))
    }

    if (item.kind === 'BooleanValue') {
        return types.booleanLiteral(item.value)
    }

    if (item.kind === 'ObjectValue') {
        const objectProperties = createObjectPropertiesFromFields(
            types,
            item.fields
        )

        return types.objectExpression(objectProperties)
    }

    if (item.kind === 'ListValue') {
        const arrayItems = item.values.map(curField =>
            createValuesFromItem(types, curField)
        )

        return types.arrayExpression(arrayItems)
    }
}

const createValuesFromField = (types, field) => {
    if (field.value.kind === 'Variable') {
        return types.identifier(field.value.name.value)
    }

    if (field.value.kind === 'StringValue') {
        return types.stringLiteral(field.value.value)
    }

    if (field.value.kind === 'IntValue') {
        return types.numericLiteral(parseInt(field.value.value, 10))
    }

    if (field.value.kind === 'FloatValue') {
        return types.numericLiteral(parseFloat(field.value.value))
    }

    if (field.value.kind === 'BooleanValue') {
        return types.booleanLiteral(field.value.value)
    }

    if (field.value.kind === 'ObjectValue') {
        const objectProperties = createObjectPropertiesFromFields(
            types,
            field.value.fields
        )

        return types.objectExpression(objectProperties)
    }

    if (field.value.kind === 'ListValue') {
        const arrayItems = field.value.values.map(item =>
            createValuesFromItem(types, item)
        )

        return types.arrayExpression(arrayItems)
    }
}

const createObjectPropertiesFromFields = (types, fields) => {
    return fields.map(field =>
        types.objectProperty(
            types.identifier(field.name.value),
            createValuesFromField(types, field)
        )
    )
}

const createParamsFuncBody = (types, paramsFields, fields) => {
    const fieldsObjectProperty = fields
        ? [createFieldsObjectProperty(types, fields)]
        : []

    const paramsFieldsObjectProperties = paramsFields
        ? createObjectPropertiesFromFields(types, paramsFields)
        : []

    return [...fieldsObjectProperty, ...paramsFieldsObjectProperties]
}

const paramsArgToValue = ({ types, arg, fields, variables }) => {
    if (fields || (arg && arg.value.kind === 'ObjectValue')) {
        const paramsFuncBodyProperties = createParamsFuncBody(
            types,
            arg.value.fields,
            fields
        )
        const paramsFuncBody = types.objectExpression(paramsFuncBodyProperties)

        const funcArgs = variablesToFunctionArgument({ types, variables })

        return types.arrowFunctionExpression([funcArgs], paramsFuncBody)
    }

    throw new Error(
        `The value of "params" property of "${name}" can be of type "Variable" or "StringValue", but received "${arg.value.kind}"`
    )
}

const dataArgToValue = ({ types, arg, variables }) => {
    if (arg && arg.value.kind === 'ObjectValue') {
        const paramsFuncBodyProperties = createParamsFuncBody(
            types,
            arg.value.fields
        )

        const paramsFuncBody = types.objectExpression(paramsFuncBodyProperties)

        const funcArgs = variablesToFunctionArgument({ types, variables })

        return types.arrowFunctionExpression([funcArgs], paramsFuncBody)
    }

    throw new Error(
        `The value of "params" property of "${name}" can be of type "Variable" or "StringValue", but received "${arg.value.kind}"`
    )
}

module.exports.resourceToObjectProperty = ({ variables, resource, types }) => {
    const { name, args, fields } = resource
    const finalResourceProperties = args.reduce((resourceProperties, arg) => {
        if (arg.name.value === 'id') {
            return {
                ...resourceProperties,
                id: idArgToValue(types, arg),
            }
        }

        if (arg.name.value === 'params') {
            return {
                ...resourceProperties,
                params: paramsArgToValue({ types, arg, fields, variables }),
            }
        }

        if (arg.name.value === 'data') {
            return {
                ...resourceProperties,
                data: dataArgToValue({ types, arg, variables }),
            }
        }

        return {
            ...resourceProperties,
            [arg.name.value]: createValuesFromField(types, arg),
        }
    }, {})

    return types.objectProperty(
        types.identifier(name),
        types.objectExpression(
            Object.entries(finalResourceProperties).map(([key, value]) => {
                return types.objectProperty(types.identifier(key), value)
            })
        )
    )
}
