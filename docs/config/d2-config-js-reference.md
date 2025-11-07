# Configuration File Reference

The DHIS2 application platform configuration file is `d2.config.js`.<br/>
It should be placed in the root directory of your project, next to `package.json`

The default export from `d2.config.js` should be a JSON-serializable object.

All properties are technically optional, but it is recommended to set them explicitly.

It's possible to get TypeScript/Intellisense hints for `d2.config.js` by using this decorator: (available in `@dhis2/cli-app-scripts` > 12.6.0)

```js
// d2.config.js

/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    type: 'app',
    ...
}
module.exports = config
```

## Supported Properties

The following configuration properties are supported:

|         Property         |             Type              | Default           | Description                                                                                                                                                                                                                                                                                                               |
| :----------------------: | :---------------------------: | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|         **type**         |           _string_            | **app**           | Either **app**, **login_app** or **lib**                                                                                                                                                                                                                                                                                  |
|         **name**         |           _string_            | `pkg.name`        | A short, machine-readable unique name for this app                                                                                                                                                                                                                                                                        |
|        **title**         |           _string_            | `config.name`     | The human-readable application title, which will appear in the HeaderBar                                                                                                                                                                                                                                                  |
|      **direction**       | `'ltr'`, `'rtl'`, or `'auto'` | `'ltr'`           | Sets the `dir` HTML attribute on the `document` of the app. If set to `'auto'`, the direction will be inferred from the current user's UI locale setting. The header bar will always be considered 'auto' and is unaffected by this setting.                                                                              |
|          **id**          |           _string_            |                   | The ID of the app on the [App Hub](https://apps.dhis2.org/). Used when publishing the app to the App Hub with [d2 app scripts publish](../scripts/publish). See [this guide](https://developers.dhis2.org/docs/guides/publish-apphub/) to learn how to set up continuous delivery.                                        |
|     **description**      |           _string_            | `pkg.description` | A full-length description of the application                                                                                                                                                                                                                                                                              |
|        **author**        |     _string_ or _object_      | `pkg.author`      | The name of the developer to include in the DHIS2 manifest, following [package.json author field syntax](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#people-fields-author-contributors).                                                                                                                   |
|   **entryPoints.app**    |           _string_            | **./src/App**     | The path to the application entrypoint (not used for libraries)                                                                                                                                                                                                                                                           |
|  **entryPoints.plugin**  |           _string_            |                   | The path to the application's plugin entrypoint (not used for libraries)                                                                                                                                                                                                                                                  |
|   **entryPoints.lib**    |     _string_ or _object_      | **./src/index**   | The path to the library entrypoint(s) (not used for applications). Supports [conditional exports](https://nodejs.org/dist/latest-v16.x/docs/api/packages.html#packages_conditional_exports)                                                                                                                               |
|   **skipPluginLogic**    |           _boolean_           | **false**         | By default, plugin entry points will be wrapped with logic to allow the passing of properties and resizing between the parent app and the child plugin. This logic will allow users to use the plugin inside an app when wrapped in `<Plugin>` component from app-runtime. If set to true, this logic will not be loaded. |
|      **pluginType**      |           _string_            |                   | Gets added to the `plugin_type` field for this app in the `/api/apps` response -- an example is `pluginType: 'DASHBOARD'` for a plugin meant to be consumed by the Dashboard app. Must be contain only characters from the set A-Z (uppercase), 0-9, `-` and `_`; i.e., it's tested against the regex `/^[A-Z0-9-_]+$/`.  |
|  **dataStoreNamespace**  |           _string_            |                   | The DataStore and UserDataStore namespace to reserve for this application. The reserved namespace **must** be suitably unique, as other apps will fail to install if they attempt to reserve the same namespace - see the [webapp manifest docs](https://docs.dhis2.org/en/develop/loading-apps.html)                     |
| **additionalNamespaces** |        _Array(object)_        |                   | An array of additional datastore namespaces that should be associated with the app. For each, the user can specify the authorities required to read/write. See more in the [Additional datastore namespaces section](#additional-datastore-namespaces) below.                                                             |
|  **customAuthorities**   |        _Array(string)_        |                   | An array of custom authorities to create when installing the app, these do not provide security protections in the DHIS2 REST API but can be assigned to user roles and used to modify the interface displayed to a user - see the [webapp manifest docs](https://docs.dhis2.org/en/develop/loading-apps.html)            |
|   **minDHIS2Version**    |           _string_            |                   | The minimum DHIS2 version the App supports (eg. '2.35'). Required when uploading an app to the App Hub. The app's major version in the app's package.json needs to be increased when changing this property.                                                                                                              |
|   **maxDHIS2Version**    |           _string_            |                   | The maximum DHIS2 version the App supports.                                                                                                                                                                                                                                                                               |
|      **shortcuts**       |        _Array(object)_        |                   | An array of shortcuts to specific pages within an application that get added to the app menu/command palette, which can be configured as shown [here](./adding-shortcuts.md).                                                                                                                                             |
|       **coreApp**        |           _boolean_           | **false**         | **ADVANCED** If true, build an app artifact to be included as a root-level core application                                                                                                                                                                                                                               |
|      **standalone**      |           _boolean_           | **false**         | **ADVANCED** If true, do NOT include a static BaseURL in the production app artifact. This includes the `Server` field in the login dialog, which is usually hidden and pre-configured in production.                                                                                                                     |
|         **pwa**          |           _object_            |                   | **ADVANCED** Opts into and configures PWA settings for this app. Read more about the options in [the PWA docs](../pwa).                                                                                                                                                                                                   |
| **viteConfigExtensions** |     _string_ or _object_      |                   | **ADVANCED** Adds custom options to the Vite config that the App Platform uses to start and build apps. Read more on the [Extending Vite Config](extending-vite-config.md) page                                                                                                                                           |

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

## Setting the DHIS2 version

The `minDHIS2Version` and `maxDHIS2Version` allow specifying which DHIS2 version the app is compatible with. This can be used to have multiple versions of the app on the App Hub, each with their own range of supported DHIS2 versions.

For example, let's say you want to adjust your app to a breaking change in the DHIS2 api. Let's assume that the code on your app's default branch (`main`) has not yet been adapted to the breaking change and that you're working with DHIS2's workflows:

1. Set the `maxDHIS2Version` in `d2.config.js` to the last DHIS2 version that's still compatible with the code on `main`.
1. Branch `main` to a maintenance branch. The recommended naming pattern is `N.x`, where `N` should be replaced with the app's current major version (i.e. `100.x`, `101.x`, etc.). See also [semantic-release's documentation on branches](https://semantic-release.gitbook.io/semantic-release/usage/configuration#branches). The app's version can be found in `package.json`, look for the `version` field.
1. On `main` update the `minDHIS2Version` to the first DHIS2 version that contains the breaking change. It's important to publish the `minDHIS2Version` change as a breaking change. An easy way to do that is to include the `BREAKING CHANGE` label in the commit that changes the `minDHIS2Version` (see the [semantic-release documentation](https://semantic-release.gitbook.io/semantic-release/#commit-message-format) on their commit conventions).

## Additional datastore namespaces

Adds the possibility for apps to declare additional datastore namespaces that should be associated with the app. For each, the user can specify the authorities required to read/write.

Each of the additional namespace objects must declare a namespace name, and authorities by one or more of the following properties:

-   `authorities`: a user needs any of these to read or write
-   `readAuthorities`: a user needs any of these to read
-   `writeAuthorities`: a user needs any of these to write

If `authorities` is combined with read or write limited lists, the entries in authorities are added to the read/write (union).

If only `readAuthorities` are defined, these automatically apply for write.

If only `writeAuthorities` are defined, read is not restricted.

Examples of valid additional namespace objects:

```js
const config = {
    // ...
    additionalNamespaces: [
        { namespace: 'extra1', authorities: ['M_extra1'] },
        { namespace: 'extra2', readAuthorities: ['M_extra2read'] },
        { namespace: 'extra3', writeAuthorities: ['M_extra3write'] },
        {
            namespace: 'extra4',
            authorities: ['M_extra4readwrite'],
            writeAuthorities: ['M_extra4write'],
        },
    ],
}
```
