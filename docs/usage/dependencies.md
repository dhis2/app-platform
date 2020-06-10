# Dependencies

## DHIS2 Standard Libraries

The following NPM packages are automatically provided by the platform. You can reference these libraries from your source code without specifying them as explicit dependencies, though it is recommended that you also include them as dependencies in your application's `package.json`.

-   `@dhis2/app-runtime`
-   `@dhis2/ui-core`
-   `@dhis2/ui-widgets`
-   `@dhis2/d2-i18n`
-   `react` and `react-dom`
-   `classnames`
-   `prop-types`
-   `styled-jsx`

## Singleton Dependencies

Several standard DHIS2 Application dependencies require that only one copy is present in the application bundle.  This also reduces the size of the final bundle which is beneficial for network performance.

To de-duplicate singleton dependencies we recommend using [yarn-deduplicate](https://github.com/atlassian/yarn-deduplicate):

```sh
> npx yarn-deduplicate --packages react,react-dom,@dhis2/app-runtime,@dhis2/ui-core,@dhis2/d2-i18n,styled-jsx
```

You may optionally specify a different version of one of these libraries and avoid duplicate versions in your application bundle by adding a [`resolutions` map entry](https://legacy.yarnpkg.com/en/docs/selective-version-resolutions/) to `package.json`.  Use with caution, however, as this might force dependencies to use an incompatible version of one of the standard libraries, which can cause hard-to-debug issues. 

## Custom dependencies

Any custom dependencies you include in the `dependencies` array of `package.json` can be referenced from your source code. These dependencies will be tree-shaken from the final bundle, if possible.
