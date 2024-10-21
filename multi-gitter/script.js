/**
 * script to be run on all repos to upgrade to the latest version of app-platform tools
 * which uses Vite and upgrades to React 18
 */

const { execSync } = require('child_process')
const path = require('path')

const packageFile = require(path.join(process.cwd(), './package.json'))

const dependencies = [
    ...Object.keys(packageFile.dependencies),
    ...Object.keys(packageFile.devDependencies),
]

console.info('upgrading cli-app-scripts')
execSync('yarn add --dev "@dhis2/cli-app-scripts@alpha"', { stdio: 'inherit' })

console.info('upgrading cli-style')
execSync('yarn add --dev "@dhis2/cli-style@alpha"', { stdio: 'inherit' })

console.info('upgrading the UI library')
execSync('yarn add --dev "@dhis2/ui"', { stdio: 'inherit' }) //  get the latest version to avoid warnings about defaultProps in React 18

console.info('Run migration script from d2-app-scripts')
execSync('yarn d2-app-scripts migrate js-to-jsx', { stdio: 'inherit' })

console.info('Deduping dependencies')
execSync('npx yarn-deduplicate yarn.lock && yarn', { stdio: 'inherit' })

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
        `find ./src -type f -exec sed -i "s#enzyme-adapter-react-16#@cfaester/enzyme-adapter-react-18#g" {} \\;`,
        { stdio: 'inherit' }
    )
}
// ToDo: run codemod for changing default props??

// ToDo: what to do about resolutions in package.json?

execSync('npx yarn-deduplicate yarn.lock && yarn', { stdio: 'inherit' })
