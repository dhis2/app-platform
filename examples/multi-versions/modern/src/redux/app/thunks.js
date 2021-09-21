import { loadSchemas } from '../schemas/thunks'
import { loadSystemSettings } from '../systemSettings/thunks'
import { loadUserAuthorities } from '../userAuthority/thunks'

export const loadAppData = () => dispatch =>
    Promise.all([
        dispatch(loadSchemas()),
        dispatch(loadSystemSettings()),
        dispatch(loadUserAuthorities()),
    ])
