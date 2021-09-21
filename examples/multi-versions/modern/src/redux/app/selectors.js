import {
    getSchemasError,
    getSchemasLoaded,
    getSchemasLoading,
} from '../schemas/selectors'
import {
    getSystemSettingsError,
    getSystemSettingsLoaded,
    getSystemSettingsLoading,
} from '../systemSettings/selectors'
import {
    getUserAuthoritiesError,
    getUserAuthoritiesLoaded,
    getUserAuthoritiesLoading,
} from '../userAuthority/selectors'

export const getAppReady = state =>
    !getSchemasLoading(state) &&
    getSchemasLoaded(state) &&
    !getSystemSettingsLoading(state) &&
    getSystemSettingsLoaded(state) &&
    !getUserAuthoritiesLoading(state) &&
    getUserAuthoritiesLoaded(state)

export const getAppLoading = state =>
    getSchemasLoading(state) ||
    getSystemSettingsLoading(state) ||
    getUserAuthoritiesLoading(state)

export const getAppDataError = state =>
    getSchemasError(state) ||
    getSystemSettingsError(state) ||
    getUserAuthoritiesError(state)
