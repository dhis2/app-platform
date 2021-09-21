const glob = require('glob');
const fetch = require('node-fetch');
const { init } = require('d2/lib/d2');
const { memoize, spread, curry, replace, compose, map } = require('lodash/fp');
const fs = require('fs');

// Register a global fetch that uses node-fetch
global.fetch = fetch;
// Polyfill the Headers object that does not come with node-fetch
global.Headers = function Headers(headers) {
    const h = {
        get(key) {
            return this[key];
        },
        set(key, value) {
            this[key] = value;
        },
        has(key) {
            return Object.prototype.hasOwnProperty.call(this, key);
        },
        delete(key) {
            delete this[key];
        }
    };

    return Object.assign(h, headers);
};

function getConfig() {
    const dhisConfigPath = process.env.DHIS2_HOME && `${process.env.DHIS2_HOME}/config`;
    return require(dhisConfigPath);
}

const initD2Api = memoize(async function () {
    const config = getConfig();

    const initOptions = {
        baseUrl: `${config.baseUrl}/api`,
        headers: {
            Authorization: config.authorization,
        },
    };

    const d2 = await init(initOptions);

    return d2.Api.getApi();
});

function saveFixture(url, response) {
    return new Promise((resolve, reject) => {
        fs.writeFile(`${__dirname}/fixtures/${url}.json`, JSON.stringify(response, undefined, 2), function(err) {
            if(err) {
                return reject(err);
            }

            console.log(`Fixture (${url}) updated`);
            resolve();
        });
    });
}

const getFixtureFromTheApi = curry((url, api) => {
    return api.get(`${url}`).then(response => [url, response]);
});

function createFixtureFromApi(url) {
    return initD2Api()
        .then(getFixtureFromTheApi(url))
        .then((spread(saveFixture)))
        .catch(console.error.bind(console));
}

function getFixturePaths(rootPath = __dirname) {
    return new Promise((resolve, reject) => {
        glob('**/*.json', { cwd: rootPath }, (err, files) => {
            if (err) {
                return reject(err);
            }
            resolve(files);
        });
    });
}

const getApiPathFromFixturePath = compose(replace('fixtures/', ''), replace('.json', ''));

function updateFixturesForFilePaths(files) {
    return Promise.all(map(createFixtureFromApi, files));
}

function updateFixtures() {
    return getFixturePaths()
        .then(map(getApiPathFromFixturePath))
        .then(updateFixturesForFilePaths);
}

updateFixtures()
    .then('All fixtures updated!')
    .catch(err => console.error(err));
