const { exec } = require('@dhis2/cli-helpers-engine')

module.exports = ({ paths }) => ({
    build: async ({ image, tag }) => {
        await exec({
            cmd: 'docker',
            args: [
                'build',
                '-f',
                paths.dockerFile,
                '.',
                '-t',
                `${image}:${tag}`,
            ],
            cwd: paths.base,
            pipe: true,
        })
    },
    push: async ({ image, tag }) => {
        await exec({
            cmd: 'docker',
            args: ['push', `${image}:${tag}`],
            cwd: paths.base,
            pipe: true,
        })
    },
})
