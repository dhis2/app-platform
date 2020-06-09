# Dependencies

## DHIS2 Standard Libraries

The following NPM packages are automatically provided by the platform, so their version is fixed and cannot be overwritten. You can reference these libraries from your source code without specifying them as explicit dependencies.

-   `@dhis2/app-runtime`
-   `@dhis2/ui`
-   `@dhis2/d2-i18n`
-   `react` and `react-dom`
-   `classnames`
-   `prop-types`
-   `styled-jsx`

> _Note_: You may optionally specify a different version of one of these libraries as a runtime dependency in your `package.json`. To avoid duplicate versions in your application bundle, particularly for dependencies like `react` and `@dhis2/app-runtime` which require stable references, you may also need to add a [`resolutions` map entry](https://legacy.yarnpkg.com/en/docs/selective-version-resolutions/) to `package.json`.

## Custom dependencies

Any custom dependencies you include in the `dependencies` array of `package.json` can be referenced from your source code. These dependencies will be tree-shaken from the final bundle, if possible.
