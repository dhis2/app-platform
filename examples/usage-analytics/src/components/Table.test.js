import React from 'react'
import { shallow } from 'enzyme'
import { Table, TableHead, TableBody, TableRow, mapStateToProps } from './Table'
import { LOADING, ERROR } from '../constants/statuses'
import * as CATS from '../constants/categories'
import * as AGGRS from '../constants/aggregations'
import { WEEK } from '../constants/intervals'
import { dataStatistics, topFavorites } from '../__mockData__/usageData'

const defaultState = {
    filter: {
        aggregationLevel: AGGRS.SUM,
        category: CATS.FAVORITE_VIEWS,
        interval: WEEK,
    },
    usageData: dataStatistics,
}

const getWrapperForState = ({ filter, usageData }) => {
    const state = {
        filter: { ...defaultState.filter, ...filter },
        usageData: usageData || defaultState.usageData,
    }
    const props = mapStateToProps(state)
    return shallow(<Table {...props} />)
}

describe('<Table/>', () => {
    it('Renders a <CircularProgress/> when usageData equals LOADING', () => {
        const wrapper = getWrapperForState({ usageData: LOADING })
        expect(wrapper.find('CircularProgress').length).toEqual(1)
    })
    it('Renders an <Error/> when usageData equals ERROR', () => {
        const wrapper = getWrapperForState({ usageData: ERROR })
        expect(wrapper.find('Error').length).toEqual(1)
    })
    it('Produces the correct table for category FAVORITE_VIEWS and aggregationLevel SUM', () => {
        const wrapper = getWrapperForState({})
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces the correct table for category FAVORITE_VIEWS and aggregationLevel AVERAGE', () => {
        const wrapper = getWrapperForState({
            filter: { aggregationLevel: AGGRS.AVERAGE },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces the correct table for category FAVORITES_SAVED', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.FAVORITES_SAVED },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces the correct table for category USERS', () => {
        const wrapper = getWrapperForState({ filter: { category: CATS.USERS } })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces the correct table for category TOP_FAVORITES', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.TOP_FAVORITES },
            usageData: topFavorites,
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces the correct table for category DATA_VALUES', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.DATA_VALUES },
        })
        expect(wrapper).toMatchSnapshot()
    })
})

const tableData = {
    headers: ['Header 1', 'Header 2'],
    rows: [['value a1', 'value a2'], ['value b1', 'value b2']],
}

describe('<TableHead />', () => {
    it('Matches the snapshot', () => {
        const wrapper = shallow(<TableHead headers={tableData.headers} />)
        expect(wrapper).toMatchSnapshot()
    })
})

describe('<TableBody />', () => {
    it('Matches the snapshot', () => {
        const wrapper = shallow(<TableBody rows={tableData.rows} />)
        expect(wrapper).toMatchSnapshot()
    })
})

describe('<TableRow />', () => {
    it('Matches the snapshot', () => {
        const wrapper = shallow(<TableRow cells={tableData.rows[0]} />)
        expect(wrapper).toMatchSnapshot()
    })
})
