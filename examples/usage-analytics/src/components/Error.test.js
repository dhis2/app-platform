import React from 'react'
import { shallow } from 'enzyme'
import Error from './Error'

const testMessage = 'Test error message'
const defaultProps = {
    message: testMessage,
}

describe('<Error/>', () => {
    it('Matches the snapshot', () => {
        const tree = shallow(<Error {...defaultProps} />)
        expect(tree).toMatchSnapshot()
    })
    it('Renders renders the message passed to it', () => {
        const wrapper = shallow(<Error {...defaultProps} />)
        expect(wrapper.find('div.uaa-error').text()).toEqual(testMessage)
    })
})
