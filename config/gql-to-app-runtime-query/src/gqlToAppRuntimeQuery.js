const gql = require('graphql-tag')
const { extractResources } = require('./extractResources')
const { resourceToObjectProperty } = require('./resourceToObjectProperty')
const { validators } = require('./validators')

const getGraphqlType = variableDefinition =>
    variableDefinition.type.kind === 'NonNullType'
        ? variableDefinition.type.type.name.value
        : variableDefinition.type.name.value

const getTypeOfVariable = variableDefinition => {
    const graphqlType = getGraphqlType(variableDefinition)
    const is = v => v === graphqlType

    if (is('String') || is('ID')) return 'StringLiteral'
    if (is('Int') || is('Float')) return 'NumberLiteral'
    if (is('Boolean')) return 'BooleanLiteral'
    if (is('Object')) return 'ObjectExpression'
    if (is('Array')) return 'ArrayExpression'

    throw new Error(`Type "${graphqlType}" not supported`)
}

const getDefaultValueOfVariable = variableDefinition => {
    if (!variableDefinition.defaultValue) return undefined

    if ('ObjectExpression' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.fields
    }

    if ('ArrayExpression' === variableDefinition.defaultValue.kind) {
        return variableDefinition.defaultValue.values
    }

    return variableDefinition.defaultValue.value
}

const validateVariableDefaultValues = variables => {
    variables.forEach(({ defaultValue, name, graphqlType }) => {
        if (!defaultValue) return

        const validator = validators[graphqlType]

        if (!validator) {
            const availableTypes = Object.keys(validators).join(', ')

            throw new Error(
                `Unsupported variable type "${graphqlType}", available types are: ${availableTypes}`
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
        graphqlType: getGraphqlType(variableDefinition),
        defaultValue: getDefaultValueOfVariable(variableDefinition),
        required: variableDefinition.type.kind === 'NonNullType',
    }))
}

module.exports.gqlToAppRuntimeQuery = ({ types }) => {
    return {
        visitor: {
            TaggedTemplateExpression(path) {
                try {
                    const { node } = path
                    const { tag, quasi } = node

                    if (tag.name !== 'gql') return

                    const quasis = quasi.quasis
                    validateHasSingleExpression(quasis)

                    const definition = extractQueryDefinition(quasis)
                    // const { operation } = definition

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

                    path.replaceWith(
                        types.objectExpression(resourcesObjectExpressions)
                    )
                } catch (e) {
                    console.log(
                        [
                            e.message,
                            ...e.stack
                                .split('\n')
                                .map(
                                    line =>
                                        line.match(
                                            /gql-to-app-runtime-query\/src.*:\d+:\d/
                                        )?.[0]
                                )
                                .filter(i => i)
                                .map(line => `  at ${line}`),
                        ].join('\n')
                    )
                }
            },
        },
    }
}
