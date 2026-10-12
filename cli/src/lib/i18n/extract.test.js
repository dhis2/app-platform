jest.mock('i18next-conv')
jest.mock('i18next-scanner')
jest.mock('fs-extra')
jest.mock('../parseConfig')
jest.mock('./helpers')

const fs = require('fs-extra')
const { i18nextToPot } = require('i18next-conv')
const scanner = require('i18next-scanner')
const parseConfig = require('../parseConfig')
const extract = require('./extract')
const helpers = require('./helpers')

const paths = { base: '/app', src: '/app/src' }

// Grab the `en` object that extract serialises into the .pot file
const getExtractedStrings = () => JSON.parse(i18nextToPot.mock.calls[0][1])

beforeEach(() => {
    jest.clearAllMocks()

    helpers.checkDirectoryExists.mockReturnValue(true)
    helpers.walkDirectory.mockReturnValue(['/app/src/App.js'])
    helpers.arrayEqual.mockReturnValue(false)

    fs.readFileSync.mockReturnValue('')
    fs.existsSync.mockReturnValue(false)

    i18nextToPot.mockResolvedValue('pot-content')

    // Pretend the scanner always finds one regular translation string so that
    // `en` is never empty and extract always reaches the .pot write step
    scanner.Parser.mockImplementation(() => ({
        parseFuncFromString: () => ({ get: () => undefined }),
        get: () => ({ en: { translation: { Hello: 'Hello' } } }),
        pluralSuffixes: {},
    }))
})

describe('i18n extract', () => {
    it('emits manifest strings when the config has an app entry point', async () => {
        parseConfig.mockReturnValue({
            title: 'My App',
            description: 'My App description',
            shortcuts: [{ name: 'Apps Home' }],
            entryPoints: { app: './src/App' },
        })

        await extract({ input: paths.src, output: '/app/i18n', paths })

        const en = getExtractedStrings()
        expect(en).toMatchObject({
            '__MANIFEST_APP_TITLE_Application title': 'My App',
            '__MANIFEST_APP_DESCRIPTION_Application description':
                'My App description',
            '__MANIFEST_SHORTCUT_Apps Home_Title for shortcut used by command palette':
                'Apps Home',
        })
    })

    it('does not emit manifest strings when the config has no app entry point', async () => {
        parseConfig.mockReturnValue({
            title: 'My Lib',
            description: 'My Lib description',
            entryPoints: { lib: './src/index' },
        })

        await extract({ input: paths.src, output: '/app/i18n', paths })

        const en = getExtractedStrings()
        expect(Object.keys(en)).toEqual(['Hello'])
    })

    it('omits manifest keys whose config value is missing', async () => {
        parseConfig.mockReturnValue({
            shortcuts: [{ name: 'Apps Home' }, { url: '/no-name' }],
            entryPoints: { app: './src/App' },
        })

        await extract({ input: paths.src, output: '/app/i18n', paths })

        const en = getExtractedStrings()
        expect(Object.keys(en)).not.toContain(
            '__MANIFEST_APP_TITLE_Application title'
        )
        expect(Object.keys(en)).not.toContain(
            '__MANIFEST_APP_DESCRIPTION_Application description'
        )
        expect(
            Object.keys(en).filter((k) => k.startsWith('__MANIFEST_SHORTCUT_'))
        ).toEqual([
            '__MANIFEST_SHORTCUT_Apps Home_Title for shortcut used by command palette',
        ])
    })
})

// Runs the real scanner and i18next-conv, so this depends on the i18next
// version the scanner resolves. i18next >= 24 used to break plural extraction
describe('i18n extract plurals', () => {
    const { Parser } = jest.requireActual('i18next-scanner')
    const conv = jest.requireActual('i18next-conv')

    beforeEach(() => {
        parseConfig.mockReturnValue({ entryPoints: {} })
        fs.readFileSync.mockReturnValue(
            "i18n.t('And {{count}} other', { count: n, defaultValue_plural: 'And {{count}} others' })"
        )
        scanner.Parser.mockImplementation((options) => new Parser(options))
        i18nextToPot.mockImplementation(conv.i18nextToPot)
    })

    it('writes strings with a count as msgid_plural entries', async () => {
        await extract({ input: paths.src, output: '/app/i18n', paths })

        const pot = fs.writeFileSync.mock.calls[0][1]
        expect(pot).toContain('msgid "And {{count}} other"\nmsgid_plural')
        expect(pot).toContain('msgstr[1] "And {{count}} others"')
    })
})
