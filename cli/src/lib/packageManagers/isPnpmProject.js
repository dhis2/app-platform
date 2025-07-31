const paths = require('../paths')

const isPnpmProject = () => {
    return paths.pnpmLock !== null
}

module.exports = isPnpmProject
