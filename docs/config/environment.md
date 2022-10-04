---
title: Environment Variables
---

:::warning 
In almost all applications the defaults should work out of the box - avoid using environment variable configuration! Leave these variables undefined unless you know what you're doing and have a very unique requirement.
:::

The following environment variables are supported for `start` and/or `build` commands. They can be specified in the shell environment on in a local `.env` file.

| Variable              | Type     | Commands         | Description                                                                                                                                                                                                                                                                                       |
| --------------------- | -------- | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PORT**              | _Number_ | `start`          | Specify the Port to use when running the development server. Can also be specified with the `--port` flag on the command-line                                                                                                                                                                     |
| **PUBLIC_URL**        | _String_ | `start`, `build` | **ADVANCED USERS ONLY** Specify the contextualized path at which the application will be deployed. By default this will be `.`, but it can be overridden manually in rare cases.                                                                                                                  |
| **DHIS2_BASE_URL**    | _String_ | `start`, `build` | **ADVANCED USERS ONLY** Specify the base URL of the DHIS2 server to bake into the production artifact. In almost all cases the defaults are preferred, as they are pre-configured to work as installed DHIS2 applications.                                                                        |
| **DHIS2_API_VERSION** | _Number_ | `start`, `build` | **DEPRECATED** Specify the version of DHIS2 API to use. As of App Platform v5.3, the shell will automatically detect the version of the DHIS2 server instance and set the API version to the latest version available. _This configuration option SHOULD NOT BE USED and will be deprecated soon_ |
