const path = require('path')
const xspawn = require('cross-spawn')
const { getPWAEnvVars } = require('../pwa')
const getEnv = require('./env')

// @TODO: Export `spawn` from @dhis2/cli-helpers-engine
// and use that one instead of this one
const spawn = (...args) => {
    return new Promise((resolve, reject) => {
        const ls = xspawn(...args)

        ls.on('close', code => {
            if (code !== 0) {
                reject(code)
            } else {
                resolve()
            }
        })
    })
}

const getReactScripts = () =>
    path.join(
        require.resolve('react-scripts/package.json'),
        '../bin/react-scripts.js'
    )

const runReactScripts = async (args, options) => {
    const reactScripts = getReactScripts()
    await spawn('node', [reactScripts, ...args], options)
}

module.exports.craInit = async function craInit({ verbose, name, cwd }) {
    // @TODO: document this
    const template = process.env.TEMPLATE_PATH
        ? `file:${process.env.TEMPLATE_PATH}`
        : '@dhis2/cra-template-dhis2-app'

    const stdio = verbose ? 'inherit' : undefined

    // @TODO: Export `spawn` from @dhis2/cli-helpers-engine
    // and use that one here
    await spawn('npx', ['create-react-app', '--template', template, name], {
        cwd,
        stdio,
    })
}

module.exports.craBuild = async function craBuild({ config, cwd, verbose }) {
    await runReactScripts(['build'], {
        cwd,
        stdio: verbose ? 'inherit' : undefined,
        env: {
            // process crashes when not providing this
            ...process.env,
            BUILD_PATH: 'build/app',
            ...getEnv({
                name: config.title,
                ...getPWAEnvVars(config),
            }),
        },
    })
}

module.exports.craStart = async function craStart({
    config,
    port,
    cwd,
    verbose,
}) {
    const stdio = verbose ? 'inherit' : undefined
    const env = {
        // process crashes when not providing this
        ...process.env,

        ...getEnv({
            name: config.title,
            port,
            ...getPWAEnvVars(config),
        }),
    }

    await runReactScripts(['start', '--port', port], { cwd, stdio, env })
}

module.exports.craTest = async function craTest({ cwd, testArgs }) {
    await runReactScripts(['test', ...testArgs], {
        cwd,
        stdio: 'inherit',
    })
}
