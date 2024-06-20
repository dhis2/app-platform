# d2 app scripts start

Run a live-reloading development server on localhost

> **NOTE**: This command is currently unsupported for libraries

```sh
> d2 app scripts start --help
d2-app-scripts start

Start a development server running a DHIS2 app within the DHIS2 app-shell

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd       working directory to use (defaults to cwd)
  --port, -p  The port to use when running the development server       [number]
  --proxy, -P  The remote DHIS2 instance the proxy should point to      [string]
  --proxyPort  The port to use when running the proxy   [number] [default: 8080]
  --app        Start a dev server for just the app entrypoint (instead of both
               app and plugin, if this app has a plugin)               [boolean]
  --plugin     Start a dev server for just the plugin entrypoint       [boolean]
```
