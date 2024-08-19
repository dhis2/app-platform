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
  --cwd           working directory to use (defaults to cwd)
  --force         Force updating the app shell; normally, this is only done when
                  a new version of @dhis2/cli-app-scripts is detected. Also
                  passes the --force option to the Vite server to reoptimize
                  dependencies                                         [boolean]
  --port, -p      The port to use when running the development server
                                                        [number] [default: 3000]
  --proxy, -P     The remote DHIS2 instance the proxy should point to   [string]
  --proxyPort     The port to use when running the proxy[number] [default: 8080]
  --host          Exposes the server on the local network. Can optionally
                  provide an address to use. [boolean or string]
  --allowJsxInJs  Add Vite config to handle JSX in .js files. DEPRECATED: Will
                  be removed in @dhis2/cli-app-scripts v13. Consider using the
                  migration script `d2-app-scripts migrate js-to-jsx` to avoid
                  needing this option                                  [boolean]
```
