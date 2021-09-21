import { checkAuthorities } from '../checkAuthorities'

describe('checkAuthorities', () => {
    const requiredAuthorities = [['FOO'], ['BAR', 'BAZ']]

    it('should return true when user has "ALL" privilege', () => {
        const givenAuthorities = ['ALL']
        const hasAuthorities = checkAuthorities(
            requiredAuthorities,
            givenAuthorities
        )

        expect(hasAuthorities).toBe(true)
    })

    it('should return true when user has one of required 1st depth privileges', () => {
        const givenAuthorities = ['FOO']
        const hasAuthorities = checkAuthorities(
            requiredAuthorities,
            givenAuthorities
        )

        expect(hasAuthorities).toBe(true)
    })

    it('should return true when user has subset of 2nd depth privileges', () => {
        const givenAuthorities = ['BAR']
        const hasAuthorities = checkAuthorities(
            requiredAuthorities,
            givenAuthorities
        )

        expect(hasAuthorities).toBe(true)
    })

    it('should return false when user does not have one of the required privileges', () => {
        const givenAuthorities = ['FOOBAR']
        const hasAuthorities = checkAuthorities(
            requiredAuthorities,
            givenAuthorities
        )

        expect(hasAuthorities).toBe(false)
    })
})
