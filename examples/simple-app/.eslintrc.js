// This is necessary (and can't use @dhis2/cli-style) due to issues with installing Husky in
//   non-root directories, and another unknown issue with package resolution from .eslintrc.js
//   through a portal dependency.  It should be removed when those issues are resolved.

module.exports = {
    extends: ['react-app']
}
