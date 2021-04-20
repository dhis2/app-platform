const { reporter } = require('@dhis2/cli-helpers-engine')
const makeDocker = require('../lib/docker')
const exitOnCatch = require('../lib/exitOnCatch')
const loadEnvFiles = require('../lib/loadEnvFiles')
const parseConfig = require('../lib/parseConfig')
const makePaths = require('../lib/paths')

const handler = async ({ cwd }) => {
    const paths = makePaths(cwd)

    const mode = 'development'
    loadEnvFiles(paths, mode)

    const config = parseConfig(paths)
    const docker = makeDocker({ config, paths })

    const registry = 'dhis2'
    const appName = paths.base.split(/[\\/]/).pop()
    const dockerImage = `${registry}/${appName}`
    const dockerTag = 'standalone'

    await exitOnCatch(
        async () => {
            reporter.info('Building docker image...')
            await docker.build({ image: dockerImage, tag: dockerTag })

            reporter.info('Pushing docker image...')
            await docker.push({ image: dockerImage, tag: dockerTag })
        },
        {
            name: 'dockerize',
            onError: () =>
                reporter.error(
                    'Dockerize script exited with non-zero exit code'
                ),
        }
    )
}

const command = {
    command: 'dockerize',
    desc: 'Build and push docker image',
    handler,
}

module.exports = command
