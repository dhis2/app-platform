const paths = require('../paths')

const isNpmProject = () => {
    return paths.npmLock !== null
}

module.exports = isNpmProject
