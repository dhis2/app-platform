# d2-app-scripts jsx-migration

Converts files with `.js` extensions to `.jsx` if the file contains JSX syntax. This is intended as a helper for moving `@dhis2/cli-app-scripts` to Vite, which prefers files to be named as such to avoid unnecessarily parsing vanilla JS files for JSX syntax.

## Example

This should usually be run from the root directory of a project.

```sh
yarn d2-app-scripts jsx-migration
```

By default, this will crawl through each `.js` file in the `src` directory (using the glob `src/**/*.js`), look for JSX syntax in the file, then rename the file to use a `.jsx` extension if appropriate.

Then, it will crawl through all `.js` _and_ `.jsx` file in `src` and update file imports to match the newly renamed files. **By default, this will update imports without a file extension**, e.g. `import Component from './Component'` => `import Component from './Component.jsx'`. This is because, in testing, updating files to `.jsx` extensions without updating the imports ends up causing linting errors. Functionally, the app will still work without extensions on imports though; Vite handles it. If you don't want to update imports without extensions, you can use the `--skipUpdatingImportsWithoutExtension` flag when running this script. Imports that use a `.js` extension will be updated to `.jsx` either way.

Lastly, the script will check `d2.config.js` in the CWD for entry points to update if the respective files have been renamed.

## Tips

This may update a _lot_ of files; be prepared with your source control to undo changes if needed. In VSCode, for example, there is an feature in the Source Control UI to "Discard All Changes" from unstaged files. Before running the script, stage the files you want to keep around, then run the script. If the outcome isn't what you want, you can use the "Discard All Changes" option to undo them easily.

Note that renamed files are only kept track of during script execution. If, for example, you run the script, then you want to redo it with the `--skipUpdatingImportsWithoutExtension` flag, it's best to undo all the renamed files before running the script again.

### `--globString`

The script will crawl through files using the `src/**/*.js` glob by default. If you want to crawl different directories, for example to migrate smaller pieces of a project at a time, you can specify a custom glob when running the script.

Since imports will only be updated within the scope of that glob, a directory that exports its contents through an `index.js` file is an ideal choice.

Example:

```sh
yarn d2-app-scripts jsx-migration --globString "src/components/**/*.js"
```

Since the glob string will be reused and manipulated by the script, make sure to use quotes around the argument so that the shell doesn't handle it as a normal glob.

Contents of `node_modules` directories will always be ignored. `d2.config.js` will still be sought out in the CWD, but won't cause an error if one is not found.

## Usage

```sh
> d2-app-scripts jsx-migration --help
d2-app-scripts jsx-migration

Renames .js files to .jsx -- also handles file imports and d2.config.js

Global Options:
  -h, --help     Show help                                             [boolean]
  -v, --version  Show version number                                   [boolean]
  --verbose      Enable verbose messages                               [boolean]
  --debug        Enable debug messages                                 [boolean]
  --quiet        Enable quiet mode                                     [boolean]
  --config       Path to JSON config file

Options:
  --cwd                                  working directory to use (defaults to
                                         cwd)
  --skipUpdatingImportsWithoutExtension  Normally, this script will update
                                         `import './App'` to `import
                                         './App.jsx'`. Use this flag to skip
                                         adding the extension in this case.
                                         Imports that already end with .js will
                                         still be updated to .jsx
                                                      [boolean] [default: false]
  --globString                           Glob string to use for finding files to
                                         parse, rename, and update imports. It
                                         will be manipulated by the script, so
                                         it must end with .js, and make sure to
                                         use quotes around this argument to keep
                                         it a string
                                               [string] [default: "src/**/*.js"]
```
