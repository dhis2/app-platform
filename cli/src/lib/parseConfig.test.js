const { parseConfigObjects } = require('./parseConfig.js')

describe('parseConfig', () => {
    it('should correctly parse author fields', () => {
        expect(
            parseConfigObjects({ author: { name: 'Test Author' } }).author
        ).toMatchObject({ name: 'Test Author' })
        expect(
            parseConfigObjects({
                author: {
                    name: 'Test Author',
                    email: 'test@author.com',
                    url: 'https://author.com/test',
                },
            }).author
        ).toMatchObject({
            name: 'Test Author',
            email: 'test@author.com',
            url: 'https://author.com/test',
        })
        expect(
            parseConfigObjects({
                author: { name: 'Test Author', email: 'test@author.com' },
            }).author
        ).toMatchObject({ name: 'Test Author', email: 'test@author.com' })
        expect(
            parseConfigObjects({
                author: { name: 'Test Author', url: 'https://author.com/test' },
            }).author
        ).toMatchObject({ name: 'Test Author', url: 'https://author.com/test' })

        expect(
            parseConfigObjects({ author: 'Test Author' }).author
        ).toMatchObject({ name: 'Test Author' })
        expect(
            parseConfigObjects({ author: 'Test Author <test@author.com>' })
                .author
        ).toMatchObject({ name: 'Test Author', email: 'test@author.com' })
        expect(
            parseConfigObjects({
                author: 'Test Author <test@author.com> (https://author.com/test)',
            }).author
        ).toMatchObject({
            name: 'Test Author',
            email: 'test@author.com',
            url: 'https://author.com/test',
        })
        expect(
            parseConfigObjects({
                author: 'Test Author (https://author.com/test)',
            }).author
        ).toMatchObject({ name: 'Test Author', url: 'https://author.com/test' })

        // missing name
        expect(() =>
            parseConfigObjects({
                author: {
                    email: 'test@author.com',
                    url: 'https://author.com/test',
                },
            })
        ).toThrow()
        expect(
            () =>
                parseConfigObjects({ author: { email: 'test@author.com' } })
                    .author
        ).toThrow()
        expect(() =>
            parseConfigObjects({ author: { url: 'https://author.com/test' } })
        ).toThrow()
        expect(() =>
            parseConfigObjects({ author: '(https://author.com/test)' })
        ).toThrow()
        expect(() =>
            parseConfigObjects({
                author: '<test@author.com> (https://author.com/test)',
            })
        ).toThrow()
        expect(() =>
            parseConfigObjects({ author: '<test@author.com>' })
        ).toThrow()
    })
})
