export const SCHEMAS_LOAD_START = 'SCHEMAS_LOAD_START'
export const startLoadingSchemas = () => ({
    type: SCHEMAS_LOAD_START,
})

export const SCHEMAS_LOAD_ERROR = 'SCHEMAS_LOAD_ERROR'
export const loadingSchemasError = error => ({
    type: SCHEMAS_LOAD_ERROR,
    payload: { error },
})

export const SCHEMAS_SET = 'SCHEMAS_SET'
export const setSchemas = schemas => ({
    type: SCHEMAS_SET,
    payload: { schemas },
})
