import {
    loadingUserAuthoritiesError,
    setUserAuthorities,
    startLoadingUserAuthorities,
} from './actions'

const USER_AUTHORITIES_QUERY = {
    userAuthorities: { resource: 'me/authorities' },
}

export const loadUserAuthorities = () => (dispatch, getState, { engine }) => {
    dispatch(startLoadingUserAuthorities())

    return engine
        .query(USER_AUTHORITIES_QUERY)
        .then(({ userAuthorities }) =>
            dispatch(setUserAuthorities(userAuthorities))
        )
        .catch(({ message }) => dispatch(loadingUserAuthoritiesError(message)))
}
