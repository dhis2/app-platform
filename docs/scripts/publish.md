# d2 app scripts publish

Publishes a built application bundle to the [App Hub](https://apps.dhis2.org/).

You must run `d2 app scripts build` **before** running `publish`

Note that you need an App Hub API key before using this command. The API key is used to identify the user uploading the app. You can generate an API key after logging into the [App Hub](https://apps.dhis2.org/).

This command can only upload _versions_ to an app that **already** exists on the App Hub. The app must have an `id`-field in the `d2.config.js` which matches the id of the app on App Hub.

The API key can be specified with the `D2_APP_HUB_API_KEY` environment variable. For example, the following will publish the app without waiting for user input, given that `id` is in the config-file.

```sh
> d2 app scripts publish
> export D2_APP_HUB_API_KEY=xyz
> d2 app scripts publish --minVersion 2.34 --maxVersion 2.36
```

## Upload a non-platform app

This command can also be used to upload an app-version that is not a DHIS2 platform app. We encourage you to migrate to the DHIS2 platform, but we provide the ability to upload any app.
Use the `--file` option to specify the path to the file, and use options to specify other required information.

```sh
> d2 app scripts publish --file build/simple-app.zip --file-version 1.0.1 --minDHIS2Version 2.34 --appId <someAppId>
```

Note that your app must still have a manifest that matches the information you provide.

## Usage

```sh
> d2 app scripts publish --help
d2-app-scripts publish

Deploy the built application to a specific DHIS2 instance

Options:
  --cwd           working directory to use (defaults to cwd)
  --version       Show version number                                  [boolean]
  --config        Path to JSON config file
  --apikey, -k    The API-key to use for authentication                 [string]
  --channel, -c   The channel to publish the app-version to  [default: "stable"]
  --baseUrl, -b   The base-url of the App Hub instance
                                             [default: "https://apps.dhis2.org"]
  --minDHIS2Version    The minimum version of DHIS2 the app supports    [string]
  --maxDHIS2Version    The maximum version of DHIS2 the app supports    [string]
  --appId         Only used with --file option. The App Hub ID for the App to
                  publish to                                            [string]
  --file          Path to the file to upload. This skips automatic resolution of
                  the built app and uses this file-path to upload
  --file-version  Only used with --file option. The semantic version of the app
                  uploaded                                              [string]
  -h, --help      Show help                                            [boolean]
```
