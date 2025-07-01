const { normalizeExtension } = require('./extensionHelpers.js')

test('it converts filenames with .ts or .tsx extensions to .js extensions', () => {
    expect(normalizeExtension('filename.ts')).toBe('filename.js')
    expect(normalizeExtension('filename.tsx')).toBe('filename.js')
})

test('it leaves filenames with .js or .jsx extensions as-is', () => {
    expect(normalizeExtension('filename.js')).toBe('filename.js')
    expect(normalizeExtension('filename.jsx')).toBe('filename.jsx')
})
