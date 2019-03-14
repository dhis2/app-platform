import 'jest-enzyme'
import Enzyme from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'

Enzyme.configure({ adapter: new Adapter() })

// Make sure console.error calls do not clutter test output
console.error = () => {}
