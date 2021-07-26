# d2 app scripts init

Bootraps a new (or updates an existing) DHIS2 application in the directory `./<name>`, installing all required dependencies.

```sh
> d2 app scripts init --help
d2-app-scripts init <name>

Setup an app

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd    working directory to use (defaults to cwd)
  --force  Overwrite existing files and configurations[boolean] [default: false]
  --lib    Create a library                           [boolean] [default: false]
```
