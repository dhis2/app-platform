# Troubleshooting

Sometimes, things go wrong. Here are listed several situations you may encounter,

## How do I login? What is a server?

A DHIS2 application needs to talk to a [DHIS2 server](https://www.dhis2.org/downloads). When running in **development mode** (i.e. `yarn start`) the application will present a login dialog which allows the user to specify the URL of the server. In production, unless the `--standalone` option is specified, this dialog is hidden because the application is automatically configured to talk to the server where it is installed.

You should specify the fully-qualified base URL of a running DHIS2 server (including the `http://` or `https://` protocol) in the **Server** field of the login dialog.

Make sure that the the URL of your application (`localhost:3000` in this case) is included in the DHIS2 server's CORS whitelist (System Settings -> Access). Also ensure that the server
you specify doesn't have any domain-restricting proxy settings (such as the `SameSite=Lax`).

For testing purposes, `https://play.dhis2.org/dev` will NOT work because it is configured for secure same-site access, while `https://debug.dhis2.org/dev` should work.

If you have a local instance running with [`d2 cluster`](https://github.com/dhis2/cli/tree/master/packages/cluster), you can specify `http://localhost:8080` in the **Server** field.

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
