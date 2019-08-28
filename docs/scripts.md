# App Platform Scripts

The application platform comes with a set of scripts. This tool is packages as `d2-app-scripts` and is analogous to `react-scripts` in that it is the **only required dependency** for a functional and modern DHIS2 application. It can be used standalone, usually for the purposes of standing up new application repositories, or (more commonly) added as a dev dependency in the application's package.json.

To run the `init` script as a stand-alone tool, either install the D2 cli globally (`yarn global add @dhis2/cli`) and run `d2 app scripts init myapp`, or run the `init` script by itself with `npx` (`npx @dhis2/cli-app-scripts init myapp`)

To install `d2-app-scripts` as a dev dependency (this is done for you by the `init` command) run `yarn add --dev @dhis2/cli-app-scripts`.
