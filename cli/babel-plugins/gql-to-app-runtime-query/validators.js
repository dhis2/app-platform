module.exports.validators = {
    ID: ({ value, name }) => {
        if (typeof value !== 'string') {
            throw new Error(
                `Variable "${name}" of type "ID" must be a string, received type "${value}"`
            )
        }
    },
    String: ({ value, name }) => {
        if (typeof value !== 'string') {
            throw new Error(
                `Variable "${name}" must be of type "String", received type "${typeof value}"`
            )
        }
    },
    Int: ({ value, name }) => {
        if (typeof value !== 'number') {
            throw new Error(
                `Variable "${name}" must be of type "Int", received type "${typeof value}"`
            )
        }

        if (isNaN(value)) {
            throw new Error(
                `Variable "${name}" must be of type "Int", received value "NaN"`
            )
        }

        if (!Number.isInteger(value)) {
            throw new Error(
                `Variable "${name}" must be of type "Int", received value "${value}"`
            )
        }
    },
    Float: ({ value, name }) => {
        if (typeof value !== 'number') {
            throw new Error(
                `Variable "${name}" must be of type "Float", received type "${typeof value}"`
            )
        }

        if (isNaN(value)) {
            throw new Error(
                `Variable "${name}" must be of type "Float", received value "NaN"`
            )
        }
    },
    Boolean: ({ value, name }) => {
        if (typeof value !== 'boolean') {
            throw new Error(
                `Variable "${name}" must be of type "Boolean", received type "${typeof value}"`
            )
        }
    },
    Object: ({ value, name }) => {
        if (!Array.isArray(value)) {
            throw new Error(
                // @TODO: Get actual type
                `Variable "${name}" must be of type "Object", received type "${typeof value}"`
            )
        }

        value.forEach(field => {
            if (field.kind !== 'ObjectField') {
                throw new Error(
                    `Variable "${name}" must be of type "Object", received type "${typeof value}"`
                )
            }
        })
    },
    Array: ({ value, name }) => {
        if (!Array.isArray(value)) {
            throw new Error(
                `Variable "${name}" must be of type "Array", received type "${typeof value}"`
            )
        }
    },
}
