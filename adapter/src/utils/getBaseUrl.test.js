import { getBaseUrl } from './getBaseUrl.js'

const testOrigin = 'https://debug.dhis2.org'
// { [testPath]: expectedPath }
const testPaths = {
    '/dev/api/apps/simple-app/index.html': '/dev/',
    '/analytics_dev/dhis-web-maps/plugin.html': '/analytics_dev/',
    '/dhis-web-line-listing/index.html': '/',
    '/dhis-web-user-settings/': '/',
    '/hmis/staging/v41/api/apps/WHO-Data-Quality-App/app.html':
        '/hmis/staging/v41/',
}

const windowLocationMock = jest
    .spyOn(window, 'location', 'get')
    .mockImplementation(() => ({
        href: 'https://debug.dhis2.org/dev/',
        pathname: '/dev/',
    }))

afterEach(() => {
    jest.clearAllMocks()
})

test('an absolute URL is used if provided as the default', () => {
    const testBaseUrl = 'http://localhost:8080/hmis/long/path/dev'

    const url = getBaseUrl(testBaseUrl)

    expect(url).toBe(testBaseUrl)
})

describe('location variants', () => {
    const defaultRelativeBaseUrl = '..'

    for (const [testPath, expectedPath] of Object.entries(testPaths)) {
        test(testPath, () => {
            windowLocationMock.mockImplementation(() => ({
                pathname: testPath,
                href: testOrigin + testPath,
            }))

            const url = getBaseUrl(defaultRelativeBaseUrl)

            expect(url).toBe(testOrigin + expectedPath)
        })
    }
})

test("if the function doesn't match a pattern, it falls back to the provided default", () => {
    const relativeDefaultBaseUrl = '../../..'
    const testPath = '/not/a/recognized/path/index.html'
    windowLocationMock.mockImplementation(() => ({
        pathname: testPath,
        href: testOrigin + testPath,
    }))

    const url = getBaseUrl(relativeDefaultBaseUrl)

    expect(url).toBe(testOrigin + '/not/')
})
