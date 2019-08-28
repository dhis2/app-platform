# d2 app scripts test

Runs all unit tests found in `/src` with `jest`.

Tests are transpiled with `babel-jest`, so it's fine to write modern javascript there.

```sh
> d2 app scripts test --help
d2-app-scripts test

Run application unit tests

Options:
  --cwd       working directory to use (defaults to cwd)
  --version   Show version number                                      [boolean]
  --config    Path to JSON config file
  -h, --help  Show help                                                [boolean]
```
