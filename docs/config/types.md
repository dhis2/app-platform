# Types - `app` vs `lib`

The application platform works to compile, test, and bundle both **applications** and **front-end libraries** in a consistent way. This ensures that all DHIS2 application components are cross-compatible and build processes can be configured from a central location.

Building a Library is nearly identical to building an Application - just set the `type: 'lib'` property in `d2.config.js`. You can then optionally specify an entrypoint source file in `entryPoints.lib` - the default is `src/index.js`.
