# App Platform CLI

The application platform comes with a CLI. This CLI is analogous to `react-scripts` in that it is the **only required dependency** for a functional and modern DHIS2 application. It can be used standalone, usually for the purposes of standing up new application repositories, or (more commonly) added as a dev dependency in the application's package.json.

To run the `init` command of the CLI as a stand-alone tool, either install the DHIS2 cli globally (`yarn global add @dhis2/cli`) and run `d2 app scripts init myapp`, or run it dynamically with `npx` (`npx @dhis2/cli-app-scripts init myapp`)

To install the CLI as a dev dependency (this is done for you by the `init` command) run `yarn add --dev @dhis2/cli-app-scripts`.
