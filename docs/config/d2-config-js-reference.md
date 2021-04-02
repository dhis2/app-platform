# Configuration File Reference

The DHIS2 application platform configuration file is `d2.config.js`.<br/>
It should be placed in the root directory of your project, next to `package.json`

The default export from `d2.config.js` should be a JSON-srializable object.

All properties are technically optional, but it is recommended to set them explicitly.

## Supported Properties

The following configuration properties are supported:

|        Property        |      Type       | Default           | Description                                                                                                                                                                                                                                                                                                    |
| :--------------------: | :-------------: | ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|        **type**        |    _string_     | **app**           | Either **app** or **lib**                                                                                                                                                                                                                                                                                      |
|        **name**        |    _string_     | `pkg.name`        | A short, machine-readable unique name for this app                                                                                                                                                                                                                                                             |
|       **title**        |    _string_     | `config.name`     | The human-readable application title, which will appear in the HeaderBar                                                                                                                                                                                                                                       |
|    **description**     |    _string_     | `pkg.description` | A full-length description of the application                                                                                                                                                                                                                                                                   |
|       **author**       |    _string_     | `pkg.author`      | The name of the developer to include in the DHIS2 manifest                                                                                                                                                                                                                                                     |
|  **entryPoints.app**   |    _string_     | **./src/App**     | The path to the application entrypoint (not used for libraries)                                                                                                                                                                                                                                                |
|  **entryPoints.lib**   |    _string_     | **./src/index**   | The path to the library entrypoint (not used for applications)                                                                                                                                                                                                                                                 |
| **dataStoreNamespace** |    _string_     |                   | The DataStore and UserDataStore namespace to reserve for this application. The reserved namespace **must** be suitably unique, as other apps will fail to install if they attempt to reserve the same namespace - see the [webapp manifest docs](https://docs.dhis2.org/en/develop/loading-apps.html)          |
| **customAuthorities**  | _Array(string)_ |                   | An array of custom authorities to create when installing the app, these do not provide security protections in the DHIS2 REST API but can be assigned to user roles and used to modify the interface displayed to a user - see the [webapp manifest docs](https://docs.dhis2.org/en/develop/loading-apps.html) |
|      **coreApp**       |    _boolean_    | **false**         | **ADVANCED** If true, build an app artifact to be included as a root-level core application                                                                                                                                                                                                                    |
|     **standalone**     |    _boolean_    | **false**         | **ADVANCED** If true, do NOT include a static BaseURL in the production app artifact. This includes the `Server` field in the login dialog, which is usually hidden and pre-configured in production.                                                                                                          |

> _Note_: Dynamic defaults above may reference `pkg` (a property of the local `package.json` file) or `config` (another property within `d2.config.js`).

## Example

```js
const config = {
    name: 'my-app',
    title: 'My Application',
    description: 'A simple application for doing DHIS2 things',

    type: 'app',

    entryPoints: {
        app: './src/App',
    },

    dataStoreNamespace: 'my-custom-app-namespace',
    customAuthorities: ['my-app-analytics-user'],
}

module.exports = config
```
