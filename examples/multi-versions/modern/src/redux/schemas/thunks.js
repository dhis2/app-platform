import { startLoadingSchemas, setSchemas, loadingSchemasError } from './actions'

const SCHEMAS_QUERY = { schemas: { resource: 'schemas' } }

export const loadSchemas = () => (dispatch, getState, { engine }) => {
    dispatch(startLoadingSchemas())

    return engine
        .query(SCHEMAS_QUERY)
        .then(data => {
            const { schemas } = data.schemas
            const formattedSchemas = schemas.reduce((formatted, curSchema) => {
                formatted[curSchema.collectionName] = curSchema
                return formatted
            }, {})

            return dispatch(setSchemas(formattedSchemas))
        })
        .catch(({ message }) => dispatch(loadingSchemasError(message)))
}
