export const getUserAuthorities = state => state.userAuthorities

export const getUserAuthoritiesLoading = state =>
    getUserAuthorities(state).loading

export const getUserAuthoritiesLoaded = state =>
    getUserAuthorities(state).loaded

export const getUserAuthoritiesError = state => getUserAuthorities(state).error

export const getUserAuthoritiesData = state => getUserAuthorities(state).data
