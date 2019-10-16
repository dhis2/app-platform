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

## Named Import Compilation Error ([#69](https://github.com/dhis2/app-platform/issues/69))

> `'<ImportName>' is not exported by node_modules/<package>/<file>.js`

This error indicates a failure to statically resolve an import from one of the application's dependencies.

For example, when trying to import BrowserRouter from 'react-router-dom' you might see this error:

```
[ERROR] Error: 'BrowserRouter' is not exported by node_modules/react-router-dom/index.js
[ERROR]         At **src/App.js:4:9**
```

Line **4** of **src/App.js** is `import { BrowserRouter } from 'react-router-dom'`

This is problematic because the re-export in `react-router-dom/index.js` is dynamic, rather than static. The compiler cannot easily resolve a static CommonJS import which is exported dynamically at runtime. See [this rollup issue](https://github.com/rollup/rollup-plugin-commonjs/issues/211#issuecomment-337897124) for the root cause.

**Workaround**

We are hoping to support dynamic imports in the future, but for now you can work around these named import errors by importing the **default export** and then _dereferencing the named export property_. Using the above example, this would look like so:

```js
// Import the default export
import reactRouterDom from "react-router-dom";

// Dereference the named export property
// You can dereference multiple named exports in a single line
const { BrowserRouter } = reactRouterDom;
```
