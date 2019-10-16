# d2 app scripts build

Create a standalone production app build in the `./build` directory

```sh
> d2 app scripts build --help
d2-app-scripts build

Build a production app bundle for use with the DHIS2 app-shell

Options:
  --cwd       working directory to use (defaults to cwd)
  --version   Show version number                                      [boolean]
  --config    Path to JSON config file
  --mode      Specify the target build environment
                    [choices: "development", "production"] [default: production]
  --dev       Build in development mode                                [boolean]
  --watch     Watch source files for changes          [boolean] [default: false]
  --standalone  Build in standalone mode (overrides the d2.config.js setting)
                                                                       [boolean]
  -h, --help  Show help                                                [boolean]
```
