module.exports = ({ filepath, name, version }) => {
    // for scoped names in package.json
    const clean = (str) => str.replace(/@/, '').replace(/\//, '-')

    // replace placeholder within names defined in lib/paths.js
    return filepath.replace(/{name}/, clean(name)).replace(/{version}/, version)
}
