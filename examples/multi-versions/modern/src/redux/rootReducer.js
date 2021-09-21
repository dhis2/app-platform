import { combineReducers } from 'redux'

import { navigation } from './navigation'
import { schemas } from './schemas'
import { systemSettings } from './systemSettings'
import { userAuthorities } from './userAuthority'

export const rootReducer = combineReducers({
    navigation,
    schemas,
    systemSettings,
    userAuthorities,
})
