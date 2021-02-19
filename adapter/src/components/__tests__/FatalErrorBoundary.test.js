import { shallow } from 'enzyme'
import React from 'react'
import { FatalErrorBoundary } from '../FatalErrorBoundary'

const Something = () => {
    // Placeholder
    return null
}

describe('FatalErrorBoundary', () => {
    it('Should render the normal tree when no error occurs', () => {
        const wrapper = shallow(
            <FatalErrorBoundary classes={{}}>
                <div>
                    <span id="testme">Hello there!</span>
                </div>
            </FatalErrorBoundary>
        )

        expect(wrapper.find('span#testme').length).toBe(1)
    })

    it('Should render the error mask when an error is thrown', () => {
        const wrapper = shallow(
            <FatalErrorBoundary classes={{}}>
                <Something />
            </FatalErrorBoundary>
        )

        expect(wrapper.find(Something).length).toBe(1)

        const testErrorText =
            'This is a test of the emergency alert system.  This is only a test.'
        wrapper.find(Something).simulateError(new Error(testErrorText))
        expect(wrapper.contains('Something went wrong')).toBe(true)
    })

    it('Should match the snapshot tree when error is manually invoked', () => {
        const wrapper = shallow(
            <FatalErrorBoundary classes={{}}>
                <Something />
            </FatalErrorBoundary>
        )

        const error = {
            stack: 'This is the stack',
        }
        const errorInfo = {
            componentStack: 'This is the component stack',
        }

        wrapper.setState({ error, errorInfo })
        expect(wrapper.contains('Something went wrong')).toBe(true)

        expect(wrapper).toMatchSnapshot()
    })
})
