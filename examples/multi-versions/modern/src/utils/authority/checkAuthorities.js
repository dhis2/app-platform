/**
 * Returns true when one of the given authorities is in
 * at least of of the arrays in requiredAuthorities
 *
 * @param {string[][]} requiredAutorities
 * @param {string[]} givenAurothities
 * @returns {bool}
 */
export const checkAuthorities = (requiredAuthorities, givenAuthorities) =>
    !!givenAuthorities.find(authority => authority === 'ALL') ||
    requiredAuthorities.reduce(
        (authorized, requiredAuthority) =>
            authorized ||
            requiredAuthority.some(
                reqAuth => givenAuthorities.indexOf(reqAuth) !== -1
            ),
        false
    )
