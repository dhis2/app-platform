const { initApp, initLibrary } = require('../lib/index.js')

const handler = async options =>
    await (options.lib ? initLibrary(options) : initApp(options))

const command = {
    command: 'init <name>',
    desc: 'Setup an app ',
    builder: {
        force: {
            description: 'Overwrite existing files and configurations',
            type: 'boolean',
            default: false,
        },
        lib: {
            description: 'Create a library',
            type: 'boolean',
            default: false,
        },
    },
    handler,
}

module.exports = command
