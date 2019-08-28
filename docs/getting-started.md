# Getting Started

## Installation

Either install the standard [D2 CLI](cli.dhis2.nu) globally:

```sh
> yarn global add @dhis2/cli
> d2 app scripts --version
```

OR Install the [App Platform CLI](./cli) as a devDependency in an existing package

```sh
> yarn add --dev @dhis2/cli-app-scripts
```

When installed as a local devDependency, you can use the `d2-app-scripts` executable from within scripts in you `package.json` file.

## Bootstrapping

To create a new template application (or upgrade and existing React app), us the [init](./cli/init) command.

```sh
> d2 app scripts init my-test-app
> cd my-test-app


> tree # The bootstrapped application is very simple (generated yarn.lock, .d2, node_modules, and i18n directories omitted for brevity)
.
├── d2.config.js
├── package.json
└── src
    ├── App.js
    └── App.test.js


> cat package.json # The package dependencies are minimal
{
  "name": "my-test-app",
  "version": "1.0.0",
  "description": "",
  "license": "BSD-3-Clause",
  "private": true,
  "scripts": {
    "build": "d2-app-scripts build",
    "start": "d2-app-scripts start",
    "test": "d2-app-scripts test"
  },
  "devDependencies": {
    "@dhis2/cli-app-scripts": "1.2.2"
  },
  "dependencies": {
    "@dhis2/app-runtime": "^1.5.1"
  }
}

> yarn test # runs a simple unit test

> yarn start # runs a development server with a fully-encapsulated react application

> yarn build # creates a production build in the `./build` directory
```
