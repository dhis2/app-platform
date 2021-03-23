const gql = require('graphql-tag')
const { validators } = require('./validators')

const getTypeOfVariable = variableDefinition =>
    variableDefinition.type.kind === 'NonNullType'
        ? variableDefinition.type.type.name.value
        : variableDefinition.type.name.value

const getDefaultValueOfVariable = variableDefinition => {
    if (!variableDefinition.defaultValue) return undefined

    if ('ObjectValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.fields
    }

    if ('ListValue' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.values
    }

    return variableDefinition.defaultValue.value
}

const validateVariableDefaultValues = variables => {
    variables.forEach(({ defaultValue, name, type }) => {
        if (!defaultValue) return

        const validator = validators[type]

        if (!validator) {
            const availableTypes = Object.keys(validators).join(', ')

            throw new Error(
                `Unsupported variable type "${type}", available types are: ${availableTypes}`
            )
        }

        validator({ value: defaultValue, name })
    })
}

const validateHasSingleExpression = quasis => {
    if (quasis.length > 1) {
        throw new Error('"${}" Expressions are not allowed inside queries')
    }
}

const extractQueryDefinition = quasis => {
    const [templateElement] = quasis
    const query = templateElement.value.raw

    const parsedQuery = gql(query)
    const { definitions } = parsedQuery

    if (definitions.length > 1) {
        throw new Error(
            `Only 1 operation type is allowed per query, got "${definitions.length}"`
        )
    }

    const [definition] = definitions

    return definition
}

const extractVariables = definition => {
    const { variableDefinitions } = definition

    return variableDefinitions.map(variableDefinition => ({
        name: variableDefinition.variable.name.value,
        type: getTypeOfVariable(variableDefinition),
        defaultValue: getDefaultValueOfVariable(variableDefinition),
        required: variableDefinition.type.kind === 'NonNullType',
    }))
}

const getFieldsOfSelectionSet = resourceSet => {
    const { selectionSet, name } = resourceSet
    const { selections } = selectionSet

    return {
        [name.value]: selections.map(selection => {
            if (!selection.selectionSet) {
                const field = selection.name.value
                return field === '__all' ? '*' : field
            }

            return getFieldsOfSelectionSet(selection)
        }),
    }
}

const extractResources = definition => {
    const resourceSets = definition.selectionSet.selections

    return resourceSets.map(resourceSet => {
        const name = resourceSet.name.value
        const args = resourceSet.arguments
        const fields = getFieldsOfSelectionSet(resourceSet)[name]

        return { name, args, fields }
    })
}

module.exports.gqlToAppRuntimeQuery = () => {
    return {
        visitor: {
            TaggedTemplateExpression({ node: { tag, quasi } }) {
                if (tag.name !== 'gql') return

                const quasis = quasi.quasis
                validateHasSingleExpression(quasis)

                const definition = extractQueryDefinition(quasis)
                const { operation } = definition

                const variables = extractVariables(definition)
                validateVariableDefaultValues(variables)

                const resources = extractResources(definition)
                console.log(
                    JSON.stringify(
                        {
                            operation,
                            variables,
                            resources,
                        },
                        null,
                        2
                    )
                )
            },
        },
    }
}
