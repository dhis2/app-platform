# d2 app scripts packk

Create a .zip archive of a built application

> **NOTE**: This command is currently unsupported for libraries

```sh
> d2 app scripts pack --help
d2-app-scripts pack [source]

Create archive from the build.

Positionals:
  source  The source directory to pack relative to cwd.
                                                 [string] [default: ./build/app]

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd                      working directory to use (defaults to cwd)
  --destination, --dest, -d  Directory to save the packed archive to.   [string]
  --filename                 Override the filename of the archive.
                                    [string] [default: {app-name}-{version}.zip]
```
