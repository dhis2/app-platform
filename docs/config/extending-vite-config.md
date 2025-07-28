# Extending the App Platform's Vite config

It's possible to extend the App Platform's Vite configuration if necessary. This could be useful to externalize dependencies, set import aliases, or configure output chunks, among other things.

There are two ways to provide Vite config extensions using the `viteConfigExtensions` property in `d2.config.js`. Either way, the resulting config will be merged onto the App Platform's [base config](https://github.com/dhis2/app-platform/blob/master/cli/config/makeViteConfig.mjs) using Vite's `mergeConfig()` function.

1. You can provide an Object as the value of the `viteConfigExtensions` option. This approach is useful for more simple config options.
2. You can provide a path to a [Vite config file](https://vite.dev/config/), and the config will be read with Vite's [`loadConfigFromFile()` function](https://vite.dev/guide/api-javascript.html#loadconfigfromfile). This is useful more advanced config, or if you want to take advantage of Vite's useful helper functions.

:::tip
To inspect the final Vite config after merging custom options, you can add the `--debug` flag when you run `d2-app-scripts start` or `d2-app-scripts build` to see the final config logged.
:::

## Example: Using a config file

Using a config file lets you take advantage of Vite's `defineConfig()` and [`loadEnv()`](https://vite.dev/config/#using-environment-variables-in-config) helpers.

`defineConfig()` provides [Intellisense for the config object](https://vite.dev/config/#config-intellisense) and supports [config in the form of a callback](https://vite.dev/config/#conditional-config) by providing an object with relevant context as an argument to the callback. The callback [can also be asynchronous](https://vite.dev/config/#async-config).

### Making the config file

:::note
The config file uses an `.mjs` extension so that it can import the `defineConfig()` helper from `vite`, which only supports an ES Module build.
:::

```js filename='viteConfigExtensions.mjs'
import path from 'path'
import { defineConfig } from 'vite'

const viteConfig = defineConfig(async (configEnv) => {
    const { mode } = configEnv
    return {
        // In dev environments, don't clear the terminal after files update
        clearScreen: mode !== 'development',
        // Use an import alias: import from '@/' anywhere instead of 'src/'
        resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
        // ...other config options here
    }
})

export default viteConfig
```

### Using the Vite config file in `d2.config.js`

Add the path to your Vite config file as the value to `viteConfigExtensions` in `d2.config.js`.

The path can be relative or absolute. If it's relative, it will be resolved relative to the current working directory, or the location provided to the `cwd` option when running the script.

```js filename='d2.config.js'
const config = {
    name: 'simple-app',
    direction: 'auto',

    entryPoints: {
        app: './src/App.jsx',
    },

    // highlight-start
    viteConfigExtensions: './viteConfigExtensions.mjs',
    // highlight-end
}

module.exports = config
```

### Example: Simple config object

The object should match Vite's [`UserConfig` interface](https://vite.dev/config/#config-intellisense).

```js filename='d2.config.js'
const config = {
    name: 'simple-app',
    direction: 'auto',

    entryPoints: {
        app: './src/App.jsx',
    },

    // highlight-start
    viteConfigExtensions: {
        optimizeDeps: {
            include: ['@dhis2/maps-gl'],
        },
    },
    // highlight-end
}

module.exports = config
```
