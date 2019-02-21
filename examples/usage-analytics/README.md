# Usage Analytics App

[![Build Status](https://travis-ci.org/dhis2/usage-analytics-app.svg)](https://travis-ci.org/dhis2/usage-analytics-app)
[![Test Coverage](https://codeclimate.com/github/dhis2/usage-analytics-app/badges/coverage.svg)](https://codeclimate.com/github/dhis2/usage-analytics-app/coverage)
[![Code Climate](https://codeclimate.com/github/dhis2/usage-analytics-app/badges/gpa.svg)](https://codeclimate.com/github/dhis2/usage-analytics-app)
[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fdhis2-usage-analytics.svg?type=shield)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fdhis2-usage-analytics?ref=badge_shield)

This repo contains the usage analytics app. Which was rewritten from scratch and introduced in DHIS2 version 2.32.

It was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app), and later ejected.

## Developer guide

### Prerequisites

To use the usage-analytics-app in development mode, it is necessary to have a running DHIS2 instance, and be logged in to it. Most developers use their local DHIS2 instance. If you haven't configured your DHIS2_HOME env variable and set up a config.json, then the app will default to using localhost:8080 with the admin user (see
[config/webpack.config.dev.js](config/webpack.config.dev.js#L35)).

### Installation

First clone the repo, then:

```
yarn install
yarn start
```

The webpack-dev-server will start up on http://localhost:3000, by default.

### Running tests

`yarn test or yarn coverage`

### Other useful things to know

#### linting/formatting

The usage-analytics-app uses **@dhis2/packages** linting and formatting, and the build will fail if errors are found that cannot be auto-corrected. To make life easier, we suggest that you add the eslint and prettier plugins to your editor. But if you prefer, you can run the following before pushing your code:

```
yarn format
```

### Deploy

#### Local deployment

In order to test the build of the usage-analytics-app (rather than just the dev server), deploy it to your local dhis2 build. The instructions here assume a good understanding of building DHIS2 locally.

From the root of the usage-analytics-app, build the usage-analytics-app locally

```
yarn build-local
```

Then run the command below to install the built project to the `/repository/org/hisp/dhis/dhis-app-usage-analytics` folder of your .m2 directory:

```
mvn install
```

Navigate to your local dhis2 repo, `/dhis-2/dhis-web` directory. Then run the command below to build a `dhis.war` file under `dhis-web/dhis-web-portal/target`

```
mvn clean install -o
```

Finally, paste the built `dhis.war` file into you Tomcat `/webapps` directory

#### Deploy to production

Every commit to master, and version branches (i.e. v30, v31, etc.) is automatically deployed.

## License

The software is open source and released under the [BSD 2-Clause License](https://github.com/dhis2/usage-analytics-app/blob/master/LICENSE).

[![FOSSA Status](https://app.fossa.io/api/projects/git%2Bgithub.com%2Fdhis2%2Fdhis2-usage-analytics.svg?type=large)](https://app.fossa.io/projects/git%2Bgithub.com%2Fdhis2%2Fdhis2-usage-analytics?ref=badge_large)
