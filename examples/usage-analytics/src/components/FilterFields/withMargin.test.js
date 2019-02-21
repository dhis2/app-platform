import React from 'react'
import { shallow } from 'enzyme'
import withMargin from './withMargin'

describe('withMargin', () => {
    const Component = props => <div className="wrapped" {...props} />
    const ComponentWithMargin = withMargin(Component)
    const tree = shallow(<ComponentWithMargin />)

    it('returns a function', () => {
        expect(typeof ComponentWithMargin).toEqual('function')
    })

    it('matches the snapshot', () => {
        expect(tree).toMatchSnapshot()
    })
})
