# Dependencies

## DHIS2 Standard Libraries

The following NPM packages are automatically provided by the platform, so their version is fixed and cannot be overwritten. You can reference these libraries from your source code, and can add them to your package's peer dependencies, but they should **not** be included as runtime dependencies (if they are, they will be ignored)

-   `@dhis2/app-runtime`
-   `@dhis2/ui-core`
-   `@dhis2/d2-i18n`
-   `react` and `react-dom`
-   `classnames`
-   `prop-types`
-   `styled-jsx`

## Custom dependencies

Any custom dependencies you include in the `dependencies` array of `package.json` can be referenced from your source code. These dependencies will be tree-shaken from the final bundle, if possible.
