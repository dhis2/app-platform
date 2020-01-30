# Dependencies

## DHIS2 Standard Libraries

The following NPM packages are automatically provided by the platform, so their version is fixed and cannot be overwritten. You can reference these libraries from your source code without specifying them as explicit dependencies.  If you specify a different version of one of these libraries as a runtime dependency in your `package.json`, particularly for dependencies like `react` and `@dhis2/app-runtime` which require stable references, you may need to add a `resolutions` field to ensure that you don't have duplicate versions in your application bundle.

-   `@dhis2/app-runtime`
-   `@dhis2/ui-core`
-   `@dhis2/d2-i18n`
-   `react` and `react-dom`
-   `classnames`
-   `prop-types`
-   `styled-jsx`

## Custom dependencies

Any custom dependencies you include in the `dependencies` array of `package.json` can be referenced from your source code. These dependencies will be tree-shaken from the final bundle, if possible.
