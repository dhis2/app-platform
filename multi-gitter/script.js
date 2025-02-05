/**
 * script to be run on all repos to upgrade to the latest version of app-platform tools
 * which uses Vite and upgrades to React 18.
 *
 * It does few things to make the process easier:
 * 1. Upgrade to the latest version of cli-app-scripts, cli-style and UI library
 * 2. Removes the resolutions for these packages from package.json
 * 3. Runs d2 migrate script, which mainly updates d2.config and js extensions to use jsx (which is needed to optimise Vite performance)
 * 4. Dedupes the dependencies with npx yarn-deduplicate
 * 5. Upgrades test dependencies (@testing-library et al.) to a version compatible with React@18
 * 6. Run `yarn format`
 * 7. Check that React is definitely version 18
 * 8. Adds a React-18 badge to the README
 * To run it, do: multi-gitter run "node $PWD/script.js" --config ./config.yml
 */

const assert = require('assert')
const { execSync, exec } = require('child_process')
const fs = require('fs')
const path = require('path')

const packageFile = require(path.join(process.cwd(), './package.json'))

const dependencies = [
    ...Object.keys(packageFile.dependencies),
    ...Object.keys(packageFile.devDependencies),
]

console.info('upgrading cli-app-scripts')
execSync('yarn add --dev "@dhis2/cli-app-scripts"', { stdio: 'inherit' })

console.info('upgrading cli-style')
execSync('yarn add --dev "@dhis2/cli-style"', { stdio: 'inherit' })
// ToDo: run style apply and change d2.config direction to auto??

console.info('upgrading the UI library')
execSync('yarn add --dev "@dhis2/ui"', { stdio: 'inherit' }) //  get the latest version to avoid warnings about defaultProps in React 18

execSync(
    'git add --all && git commit --allow-empty --no-verify -m "chore: bump dhis2 dependencies"'
)

/**
 * Updating package.json - removing react, and react-dom, resolutions and deduping
 */
execSync(
    `jq -r 'del(.dependencies["react"])' package.json > _.json && mv _.json package.json`
)
execSync(
    `jq -r 'del(.dependencies["react-dom"])' package.json > _.json && mv _.json package.json`
)

// removing resolutions as well
const resolutionsToRemove = [
    '@dhis2/ui',
    '@dhis2/cli-app-scripts',
    '@dhis2/cli-style',
    'react',
    'react-dom',
]

resolutionsToRemove.forEach((resolution) => {
    execSync(
        `jq -r 'del(.resolutions["${resolution}"])' package.json > _.json && mv _.json package.json`
    )
})
// ToDO: double check if we also need to bump react-router

execSync(`git add package.json && yarn d2-style apply --staged`)

execSync('npx yarn-deduplicate yarn.lock && yarn', { stdio: 'inherit' })
execSync(
    'git add --all && git commit --allow-empty --no-verify -m "chore: remove react, react-dom and deduplicate dependencies"'
)

/**
 * d2 migrate script
 */
console.info('Run migration script from d2-app-scripts')
execSync('yarn d2-app-scripts migrate js-to-jsx', { stdio: 'inherit' })
execSync(
    'git add --all && git commit --allow-empty --no-verify -m "chore: run d2 migrate script"'
)

if (dependencies.includes('@testing-library/react')) {
    console.info('upgrading @testing-library/react')
    execSync('yarn add @testing-library/react', { stdio: 'inherit' })
}

if (dependencies.includes('@testing-library/user-event')) {
    console.info('upgrading @testing-library/user-event')
    execSync('yarn add @testing-library/user-event', { stdio: 'inherit' })
}

if (dependencies.includes('@testing-library/jest-dom')) {
    console.info('upgrading @testing-library/jest-dom')
    execSync('yarn add @testing-library/jest-dom', { stdio: 'inherit' })
}

if (dependencies.includes('@testing-library/react-hooks')) {
    console.info('removing @testing-library/react-hooks')
    execSync('yarn remove @testing-library/react-hooks', { stdio: 'inherit' })

    // make sure @testing-library/react is installed - sometimes it is not (like in Login app)
    execSync('yarn add @testing-library/react', { stdio: 'inherit' })
    // ToDo: next do a codemod to upgrade uses of old react-hooks
    // ! this is a naive version of such a codemod
    execSync(
        `find ./src -type f -exec sed -i "s#import { renderHook } from '@testing-library/react-hooks'#import { renderHook } from '@testing-library/react'#g" {} \\;`,
        { stdio: 'inherit' }
    )
}

if (dependencies.includes('enzyme-adapter-react-16')) {
    console.info(
        'replace enzyme-adapter-react-16 with @cfaester/enzyme-adapter-react-18'
    )
    execSync('yarn remove enzyme-adapter-react-16', {
        stdio: 'inherit',
    })
    execSync('yarn add --dev @cfaester/enzyme-adapter-react-18', {
        stdio: 'inherit',
    })

    execSync(
        `find ./ -type f -not -path "./node_modules/*" -exec sed -i "s#enzyme-adapter-react-16#@cfaester/enzyme-adapter-react-18#g" {} \\;`,
        { stdio: 'inherit' }
    )
}

try {
    // special case for identity-obj-proxy which needs to be installed separately now (it used to be a transitive dependency of CRA)
    const result = execSync(
        'grep -ri identity --exclude-dir=node_modules --exclude-dir=.d2 --exclude-dir=build --exclude=yarn.lock',
        { stdio: 'inherit' }
    )
    if (result && result?.toString().length > 0) {
        execSync('yarn add --dev identity-obj-proxy')
    }
} catch (err) {
    // I don't know why this fails sometimes, but wrapping it in try/catch for now
}

execSync('npx yarn-deduplicate yarn.lock && yarn', { stdio: 'inherit' })

execSync(
    'git add --all && git commit --allow-empty --no-verify -m "chore: update test dependencies"'
)

/**
 * format all files
 */
try {
    execSync('yarn d2-style apply', { stdio: 'inherit' })
    execSync(
        'git add --all && git commit --allow-empty --no-verify -m "chore: format all files"'
    )
} catch (err) {
    // some issues are not automatically fixable
    // Todo: decide how to do this better
    console.error(err)
}
/**
 * Check we only have React@18 installed
 */
execSync('yarn why react', { stdio: 'inherit' })

const version = execSync(
    `yarn why react | grep '=> Found' | sed -r 's/=> Found "react\\@(.+).+/\\1/'`
).toString()

console.log(`Checking installed React version: react@${version}`)
assert.match(version, /18\./, `Version found "${version}" - not version 18 :(`)

const patchPath = `${__dirname}/patches/${process.env.REPOSITORY}/0001-fix-manual-updates-for-react-vite-migration.patch`

if (fs.existsSync(patchPath)) {
    const command = `git am --signoff < ${patchPath}`

    console.info(`Running patch command: ${command}`)
    execSync(command, {
        stdio: 'inherit',
    })
}

execSync(
    `sed -i '1i![React 18](https://img.shields.io/badge/react-18-blue)\n' README.md`,
    {
        stdio: 'inherit',
    }
)

execSync('git add README.md && yarn d2-style apply --staged', {
    stdio: 'inherit',
})

/**
 * - needed to remove React dependency from apps (feels a bit crude)
 * - are the changes for tests helpful?
 * - some apps still don't have a PR preview - it would be nice to add that to make testing apps easier
 * - typescript apps (like maintenance) need to be revisited after the changes to cli-style eslint are done
 */
