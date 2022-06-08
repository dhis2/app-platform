import { shallow } from 'enzyme'
import React from 'react'
import { ErrorBoundary } from '../ErrorBoundary.js'

const Something = () => {
    // Placeholder
    return null
}

describe('ErrorBoundary', () => {
    it('Should render the normal tree when no error occurs', () => {
        const wrapper = shallow(
            <ErrorBoundary classes={{}}>
                <div>
                    <span id="testme">Hello there!</span>
                </div>
            </ErrorBoundary>
        )

        expect(wrapper.find('span#testme').length).toBe(1)
    })

    it('Should render the error mask when an error is thrown', () => {
        const wrapper = shallow(
            <ErrorBoundary classes={{}}>
                <Something />
            </ErrorBoundary>
        )

        expect(wrapper.find(Something).length).toBe(1)

        const testErrorText =
            'This is a test of the emergency alert system.  This is only a test.'
        wrapper.find(Something).simulateError(new Error(testErrorText))
        expect(wrapper.contains('Something went wrong')).toBe(true)
    })

    it('Should match the snapshot tree when error is manually invoked', () => {
        const wrapper = shallow(
            <ErrorBoundary classes={{}}>
                <Something />
            </ErrorBoundary>
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
