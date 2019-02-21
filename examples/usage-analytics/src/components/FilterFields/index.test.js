import { createValueGetterForFilterKey, mapDateRangeProps } from './index'

const state = {
    filter: {
        pageSize: 10,
        startDate: '2018-8-12',
        endDate: '2018-12-12',
    },
}

describe('FilterFields', () => {
    const createdFilterValueGetter = createValueGetterForFilterKey('pageSize')

    it('createValueGetterForFilterKey returns a function', () => {
        expect(typeof createdFilterValueGetter).toBe('function')
    })

    it('the function created by createValueGetterForFilterKey returns the correct value when called', () => {
        expect(createdFilterValueGetter(state)).toEqual({ value: 10 })
    })

    it('mapDateRangeProps returns the correct startDate and endDate', () => {
        expect(mapDateRangeProps(state)).toEqual({
            startDate: state.filter.startDate,
            endDate: state.filter.endDate,
        })
    })
})
