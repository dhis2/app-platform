import React from 'react'
import { shallow } from 'enzyme'
import { FilterSideBar, mapStateToProps } from './FilterSideBar'
import { FAVORITE_VIEWS, TOP_FAVORITES, USERS } from '../constants/categories'

const defaultState = { filter: { category: FAVORITE_VIEWS } }

describe('<FilterSideBar/>', () => {
    it('Matches the snapshot for default category: FAVORITE_VIEWS', () => {
        const props = mapStateToProps(defaultState)
        const tree = shallow(<FilterSideBar {...props} />)
        expect(tree).toMatchSnapshot()
    })
    it('Matches the snapshot for category: TOP_FAVORITES', () => {
        const state = { ...defaultState, filter: { category: TOP_FAVORITES } }
        const props = mapStateToProps(state)
        const tree = shallow(<FilterSideBar {...props} />)
        expect(tree).toMatchSnapshot()
    })
    it('Matches the snapshot for any other category, i.e. USERS', () => {
        const state = { ...defaultState, filter: { category: USERS } }
        const props = mapStateToProps(state)
        const tree = shallow(<FilterSideBar {...props} />)
        expect(tree).toMatchSnapshot()
    })
})
