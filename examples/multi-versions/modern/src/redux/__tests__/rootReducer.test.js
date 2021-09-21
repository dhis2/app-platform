import { navigation } from '../navigation'
import { rootReducer } from '../rootReducer'
import { schemas } from '../schemas'
import { systemSettings } from '../systemSettings'
import { userAuthorities } from '../userAuthority'

describe('rootReducer', () => {
    it('should produce the default state', () => {
        const actual = rootReducer()
        const expected = {
            navigation: navigation(),
            schemas: schemas(),
            systemSettings: systemSettings(),
            userAuthorities: userAuthorities(),
        }

        expect(actual).toEqual(expected)
    })
})
