# d2 app scripts deploy

Deploys a built application bundle to a running DHIS2 instance.

Note that you must run `d2 app scripts build` **before** running `deploy`

This command will prompt the user for the URL of the DHIS2 instance as well as a username and password to authenticate with that instance. The URL can be passed optionally as the first positional argument to the command, and the username with the `--username` or `-u` option. The password can be specified with the `D2_PASSWORD` environment variable. For example, the following will deploy the app without waiting for user input.

```sh
> d2 app scripts build
> export D2_PASSWORD=xyz
> d2 app scripts deploy https://play.dhis2.org/dev --username admin
```

## Usage

```sh
> d2 app scripts deploy --help
d2-app-scripts deploy [baseUrl]

Deploy the built application to a specific DHIS2 instance

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd           working directory to use (defaults to cwd)
  --username, -u  The username for authenticating with the DHIS2 instance
  --timeout       The timeout (in seconds) for uploading the app bundle
                                                                  [default: 300]
```
