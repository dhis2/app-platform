import React from 'react'
import { shallow } from 'enzyme'
import * as DropDowns from './dropDownComponents'

const onChange = jest.fn()

const defaultProps = {
    onChange,
    value: 'test',
}

describe('dropDownComponents', () => {
    it('<Category/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.Category {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
    it('<Interval/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.Interval {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
    it('<AggregationLevel/> matches the snapshot', () => {
        const wrapper = shallow(
            <DropDowns.AggregationLevel {...defaultProps} />
        )
        expect(wrapper).toMatchSnapshot()
    })
    it('<ChartType/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.ChartType {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
    it('<EventType/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.EventType {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
    it('<PageSize/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.PageSize {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
    it('<SortOrder/> matches the snapshot', () => {
        const wrapper = shallow(<DropDowns.SortOrder {...defaultProps} />)
        expect(wrapper).toMatchSnapshot()
    })
})
