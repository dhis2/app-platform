# Bootstrapping

To create a new template application (or upgrade an existing React app), use the [init](scripts/init) command.

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
    "@dhis2/cli-app-scripts": "1.4.1"
  },
  "dependencies": {
    "@dhis2/app-runtime": "^2.0.4"
  }
}

> yarn test # runs a simple unit test

> yarn start # runs a development server with a fully-encapsulated react application

> yarn build # creates a production build in the `./build` directory
```

The bootstrapped application will be a fully-functional DHIS2 app, including things like the headerbar, a login dialog, translations, and an error boundary. It can be customized from there.
