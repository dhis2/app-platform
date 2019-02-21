import React from 'react'
import { shallow } from 'enzyme'
import { Chart, mapStateToProps } from '.'
import { onChartResize } from './parseChartData'
import { LOADING } from '../../constants/statuses'
import * as CATS from '../../constants/categories'
import * as AGGRS from '../../constants/aggregations'
import * as CHARTS from '../../constants/chartTypes'
import { WEEK } from '../../constants/intervals'
import { dataStatistics } from '../../__mockData__/usageData'

const defaultState = {
    filter: {
        aggregationLevel: AGGRS.SUM,
        category: CATS.FAVORITE_VIEWS,
        interval: WEEK,
        chartType: CHARTS.TOTAL,
    },
    usageData: dataStatistics,
}

const getWrapperForState = ({ filter, usageData }) => {
    const state = {
        filter: { ...defaultState.filter, ...filter },
        usageData: usageData || defaultState.usageData,
    }
    const props = mapStateToProps(state)
    return shallow(<Chart {...props} />)
}

describe('<Chart/>', () => {
    it('Renders a <CircularProgress/> when usageData equals LOADING', () => {
        const wrapper = getWrapperForState({ usageData: LOADING })
        expect(wrapper.find('CircularProgress').length).toEqual(1)
    })
    it('Renders nothing when category equals TOP_FAVORITES', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.TOP_FAVORITES },
        })
        expect(wrapper).toBeEmptyRender()
    })
    it('Produces a correct chart for category FAVORITE_VIEWS, aggregationLevel SUM, and chartType TOTAL', () => {
        const wrapper = getWrapperForState({})
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category FAVORITE_VIEWS, aggregationLevel SUM, and chartType ALL', () => {
        const wrapper = getWrapperForState({
            filter: { chartType: CHARTS.ALL },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category FAVORITE_VIEWS, aggregationLevel AVERAGE, and chartType TOTAL', () => {
        const wrapper = getWrapperForState({
            filter: { aggregationLevel: AGGRS.AVERAGE },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category FAVORITE_VIEWS, aggregationLevel AVERAGE, and chartType ALL', () => {
        const wrapper = getWrapperForState({
            filter: { aggregationLevel: AGGRS.AVERAGE, chartType: CHARTS.ALL },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category FAVORITES_SAVED', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.FAVORITES_SAVED },
        })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category USERS', () => {
        const wrapper = getWrapperForState({ filter: { category: CATS.USERS } })
        expect(wrapper).toMatchSnapshot()
    })
    it('Produces a correct chart for category DATA_VALUES', () => {
        const wrapper = getWrapperForState({
            filter: { category: CATS.DATA_VALUES },
        })
        expect(wrapper).toMatchSnapshot()
    })
})

describe('onChartResize', () => {
    it('calls the resize method on the chart object', () => {
        const mockResize = jest.fn()
        const mockChart = {
            resize: mockResize,
        }
        onChartResize(mockChart)
        expect(mockResize).toHaveBeenCalledTimes(1)
    })
})
