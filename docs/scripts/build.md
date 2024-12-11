# d2 app scripts build

Create a standalone production app build in the `./build` directory

```sh
> d2 app scripts build --help
d2-app-scripts build

Build a production app bundle for use with the DHIS2 app-shell

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd         working directory to use (defaults to cwd)
  --mode        Specify the target build environment
                    [choices: "development", "production"] [default: production]
  --dev         Build in development mode                              [boolean]
  --verify      Validate package before building       [boolean] [default: true]
  --watch       Watch source files for changes        [boolean] [default: false]
  --standalone  Build in standalone mode (overrides the d2.config.js setting)
                                                                       [boolean]
  --allowJsxInJs  Add Vite config to handle JSX in .js files. DEPRECATED: Will
                  be removed in @dhis2/cli-app-scripts v13. Consider using the
                  migration script `d2-app-scripts migrate js-to-jsx` to avoid
                  needing this option                                  [boolean]
```
