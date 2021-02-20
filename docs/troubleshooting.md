# Troubleshooting

Sometimes, things go wrong. Here are listed several situations you may encounter,

## How do I login? What is a server?

A DHIS2 application needs to talk to a [DHIS2 server](https://www.dhis2.org/downloads). When running in **development mode** (i.e. `yarn start`) the application will present a login dialog which allows the user to specify the URL of the server. In production, unless the `--standalone` option is specified, this dialog is hidden because the application is automatically configured to talk to the server where it is installed.

You should specify the fully-qualified base URL of a running DHIS2 server (including the `http://` or `https://` protocol) in the **Server** field of the login dialog.

Make sure that the the URL of your application (`localhost:3000` in this case) is included in the DHIS2 server's CORS whitelist (System Settings -> Access). Also ensure that the server
you specify doesn't have any domain-restricting proxy settings (such as the `SameSite=Lax`).

For testing purposes, `https://play.dhis2.org/dev` will NOT work because it is configured for secure same-site access, while `https://debug.dhis2.org/dev` should work.

If you have a local instance running with [`d2 cluster`](https://github.com/dhis2/cli/tree/master/packages/cluster), you can specify `http://localhost:8080` in the **Server** field.

## Upgrading to v5.6 (for libraries only) - correcting package.json export declarations

In `@dhis2/cli-app-scripts` version 5.6.0 library compilation was changed to build each file individually, rather than bundling the entire library into a single `lib.js` file.  This change improves the chances that the library can be tree-shaken when built with an application.

As a result of this change, the name of the main entrypoints built by `d2-app-scripts build` will likely change - instead of `build/es/lib.js` and `build/cjs/lib.js` it will likely be `build/es/index.js` and `build/cjs/index.js` (replace `index.js` with the name of the `lib` entrypoint defined in `d2.config.js`).  Since libraries installed through `npm` use the `main`, `module`, and (more recently) `exports` fields in `package.json` to determine where to look for commonjs and ES module entrypoints, this could cause issues if your `package.json` isn't updated.  To make this easier, we include strict package validation in the build script.  `d2-app-scripts build` will warn you (and fail to build) if the `main`, `module`, or `exports` declarations in your `package.json` don't match what the compiler will output.  The build script will also offer to automatically fix the issue, if desired.  This should cause builds with a naïvely-upgraded `@dhis2/cli-app-scripts` to "fail fast" when a build is run on CI (rather than silently succeeding and potentially causing an invalid package to be published), while offering a painless way to fix the issue locally.

> *NOTE* - it is important, also, to specify `build/es/locales/index.js` and `build/cjs/locales/index.js` in the `sideEffects` array in `package.json`!  Without this, the locales for the library might be tree-shaken out of your application's final bundle.  This shouldn't be necessary for long (i18n should be improved in v6), but it's important to take into account when upgrading to >= v5.6

If you know what you're doing and want to use a different `main`, `module`, or `exports` value, run `d2-app-scripts build --no-verify` to skip this check at build time

---

## Named Import Compilation Error

!> **THIS ISSUE HAS BEEN RESOLVED**
!> Prior to the release of version 1.6 this issue required a complicated and inefficient workaround. As of version 1.6.0 **you should no longer encounter this error** - please upgrade to the latest version of `@dhis2/cli-app-scripts` and open an [issue on GitHub](https://github.com/dhis2/app-platform/issues/new) if the problem persists.

_See [Issue #69](https://github.com/dhis2/app-platform/issues/69)_

> `'<ImportName>' is not exported by node_modules/<package>/<file>.js`

This error indicates a failure to statically resolve an import from one of the application's dependencies.

For example, when trying to import BrowserRouter from 'react-router-dom' you might see this error:

```
[ERROR] Error: 'BrowserRouter' is not exported by node_modules/react-router-dom/index.js
[ERROR]         At **src/App.js:4:9**
```

Line **4** of **src/App.js** is `import { BrowserRouter } from 'react-router-dom'`

To resolve, please upgrade to the latest version of `@dhis2/cli-app-scripts` (`yarn add @dhis2/cli-app-scripts`)
