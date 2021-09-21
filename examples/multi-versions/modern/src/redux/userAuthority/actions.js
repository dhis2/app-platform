export const USER_AUTHORITIES_LOAD_START = 'USER_AUTHORITIES_LOAD_START'
export const startLoadingUserAuthorities = () => ({
    type: USER_AUTHORITIES_LOAD_START,
})

export const USER_AUTHORITIES_LOAD_ERROR = 'USER_AUTHORITIES_LOAD_ERROR'
export const loadingUserAuthoritiesError = error => ({
    type: USER_AUTHORITIES_LOAD_ERROR,
    payload: { error },
})

export const USER_AUTHORITIES_SET = 'USER_AUTHORITIES_SET'
export const setUserAuthorities = userAuthorities => ({
    type: USER_AUTHORITIES_SET,
    payload: { userAuthorities },
})
