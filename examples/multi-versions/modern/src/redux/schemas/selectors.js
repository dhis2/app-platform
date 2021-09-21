export const getSchemas = state => state.schemas
export const getSchemasLoading = state => getSchemas(state).loading
export const getSchemasLoaded = state => getSchemas(state).loaded
export const getSchemasError = state => getSchemas(state).error
export const getSchemasData = state => getSchemas(state).data
