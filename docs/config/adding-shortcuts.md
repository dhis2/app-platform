# Adding App Shortcuts To The Command Palette

Starting in core version 42, apps can define shortcuts that navigate straight to particular pages in that app that will appear in the app menu/command palette.
Apps configure their shortcuts in `d2.config.js`, then when the app is uploaded to an instance, the shortcuts will be visible and searchable in the app menu.

## Initial Step:

Configuring shortcuts in `d2.config.js` requires `@dhis2/cli-app-scripts` >= [v12.4.0](https://github.com/dhis2/app-platform/releases/tag/v12.4.0).

If the current `@dhis2/cli-app-scripts` version is less than 12, see the migration guide to v12 [here](https://github.com/dhis2/app-platform/pull/migration/v12.md).

## Configuration:

In your [`d2.config.js`](<(./d2-config-js-reference.md)>), add a `shortcuts` key with an array of objects pointing to specific pages in your app, with each containing two parameters.

-   `url`: this is the hash route portion of the path to the app page, i.e. what comes after (and including) the `#` symbol

-   `name`: this is the shortcut name that will appear in the app menu/command palette

Below is a code snippet of what the setup can look like:

```js
/** @type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    // ...
    shortcuts: [
        {
            url: '#/general',
            name: 'General',
        },
        {
            url: '#/analytics',
            name: 'Analytics',
        },
    ],
}
```

## Build:

Create a build of your application by running the [`d2-app-scripts build`](../scripts/build.md) command.

This step will also generate the translations for the shortcut names included in the `d2.config.js` file, and update your translation files. This is a snippet of what the translations will look like:

```pot
msgctxt "Title for shortcut used by command palette"
msgid "__MANIFEST_SHORTCUT_General"
msgstr "General"

msgctxt "Title for shortcut used by command palette"
msgid "__MANIFEST_SHORTCUT_Analytics"
msgstr "Analytics"
```

## Deploy:

Deploy your application build on your DHIS2 instance. This can be done one of three ways.

-   Using the [`deploy`](../scripts/deploy.md) command.
-   Manual installation of the application via the `App Management` application.
-   Uploading the app to the App Hub, then installing it in the instance from there (via the App Management app)

When you launch the app menu/command palette, your app shortcuts will be available.

This is an example of what that looks like:
![shortcuts in the Command Palette](../images/app-shortcuts.png)
