---
title: d2 app scripts test
sidebar_label: d2-app-scripts test
---

Runs all unit tests found in `/src` with `jest`.

Tests are transpiled with `babel-jest`, so it's fine to write modern javascript there.

```sh
> d2 app scripts test --help
d2-app-scripts test [testRegex]

Run application unit tests

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd             working directory to use (defaults to cwd)
  --updateSnapshot  Update jest snapshots             [boolean] [default: false]
  --coverage        Collect test coverage             [boolean] [default: false]
  --watch, -w       Watch modified source files for changes
                                                      [boolean] [default: false]
  --watchAll        Watch all source files for changes[boolean] [default: false]
  --jestConfig      Path to a jest config file
```
