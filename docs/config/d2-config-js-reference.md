# Configuration File Reference

The DHIS2 application platform configuration file is `d2.config.js`.<br/>
It should be placed in the root directory of your project, next to `package.json`

The default export from `d2.config.js` should be a JSON-srializable object.

All properties are technically optional, but it is recommended to set them explicitly.

## Supported Properties

The following configuration properties are supported:

|       Property        |   Type   | Default         | Description                                                              |
| :-------------------: | :------: | --------------- | ------------------------------------------------------------------------ |
|       **name**        | _string_ | `pkg.name`      | A short, machine-readable unique name for this app                       |
|       **title**       | _string_ | `config.name`   | The human-readable application title, which will appear in the HeaderBar |
|    **description**    | _string_ |                 | A full-length description of the application                             |
|       **type**        | _string_ | **app**         | Either **app** or **lib**                                                |
|  **entryPoints.app**  | _string_ | **./src/App**   | The path to the application entrypoint (not used for libraries)          |
| **entryPoints.index** | _string_ | **./src/index** | The path to the library entrypoint (not used for applications)           |

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
}

module.exports = config
```
