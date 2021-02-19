const fs = require('fs')
const { reporter } = require('@dhis2/cli-helpers-engine')
const dotenv = require('dotenv')
const dotenvExpand = require('dotenv-expand')

module.exports = (paths, NODE_ENV) => {
    /*
     * Heavily inspired by create-react-app
     * https://github.com/facebook/create-react-app/blob/master/packages/react-scripts/config/env.js
     */

    const dotenvFiles = [
        NODE_ENV && `${paths.dotenv}.${NODE_ENV}.local`,
        NODE_ENV && `${paths.dotenv}.${NODE_ENV}`,
        NODE_ENV !== 'test' && `${paths.dotenv}.local`,
        paths.dotenv,
    ]

    dotenvFiles
        .filter(Boolean)
        .filter(fs.existsSync)
        .forEach(dotenvFile => {
            dotenvExpand(
                dotenv.config({
                    path: dotenvFile,
                })
            )
        })

    reporter.debug('ENV', process.env)
}
