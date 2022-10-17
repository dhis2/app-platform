const formatAppAuthName = require('./formatAppAuthName.js')

describe('core app handling', () => {
    it('should handle core apps', () => {
        const config = { coreApp: true, name: 'data-visualizer' }
        const formattedAuthName = formatAppAuthName(config)

        expect(formattedAuthName).toBe('M_dhis-web-data-visualizer')
    })
})

describe('non-core app handling', () => {
    it('should handle app names with hyphens', () => {
        const config = { name: 'hyphenated-string-example' }
        const formattedAuthName = formatAppAuthName(config)

        expect(formattedAuthName).toBe('M_hyphenatedstringexample')
    })

    it('should handle app names with capitals and spaces', () => {
        const config = { name: 'Multi Word App Name' }
        const formattedAuthName = formatAppAuthName(config)

        expect(formattedAuthName).toBe('M_Multi_Word_App_Name')
    })
})
