import { map, get, pipe } from 'lodash/fp'

export const getAuthoritiesFromSchema = pipe(
    get('authorities'),
    map(get('authorities'))
)
