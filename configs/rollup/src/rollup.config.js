import path from "path";

// Helpers
import configureOutput from "./configureOutput";

// Rollup plugins
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import babel from "./plugins/babel";
import postcss from "./plugins/postcss";
import importMap from "./plugins/importMap";
import replace from "./plugins/replace";
import copy from "./plugins/copy";
// import dynamicImportVars from '@rollup/plugin-dynamic-import-vars'

// Dependencies to build and mark as external
const inputs = {
  "react": "react",
  "react-dom": "react-dom",
  "styled-jsx/style": "styled-jsx/dist/style.js",
  "@dhis2/d2-i18n": "@dhis2/d2-i18n",
  "@dhis2/app-runtime": "@dhis2/app-runtime",
  "@dhis2/ui": "@dhis2/ui",
  "moment": "moment",
  "d2": "../../../../d2/src/d2.js",
  ":dhis2/shell": "./src/index.js",
  // ":dhis2/app": "../../data-visualizer-app/packages/app/src/AppWrapper.js",
  // "@dhis2/data-visualizer-plugin": "../../data-visualizer-app/packages/plugin/src/index.js",
};

const inputNames = Object.keys(inputs)

const baseDir = "./dist";
const baseScriptDir = path.join(baseDir, "static/js")

const bundler = (input, dir) => (mode = "development") => {
  const name = typeof input === 'string' ? input : Object.keys(input)[0]
  return {
    input,
    output: configureOutput({ name, dir, mode, deps: inputNames }),
    plugins: [
      nodeResolve({
        mainFields: ['browser', 'module', 'main'],
        preferBuiltins: false
      }),
      replace({ mode }),
      json(),
      commonjs({
        include: /node_modules/,
      }),
      babel({ mode }),
      // dynamicImportVars(),
      postcss({ mode }),
      copy({ baseDir }),
      importMap({ name, dir, mode, baseScriptDir }),
    ],
    external: inputNames.filter((dep) => dep !== name), //.concat(['d2']) TODO: build umd d2 with app-local version -
  };
};

const bundlers = Object.entries(inputs).map(input => 
  bundler({ [input[0]]: input[1] }, input[0][0] === ':' ? baseScriptDir : path.join(baseScriptDir, 'vendor') ))

bundlers.push(bundler({
  ":dhis2/data-visualizer/app": "../../data-visualizer-app/packages/app/src/AppWrapper.js",
  ":dhis2/data-visualizer/plugin": "../../data-visualizer-app/packages/app/src/plugin/index.js",
}, baseScriptDir))

const modes = process.env.NODE_ENV
  ? [process.env.NODE_ENV]
  : ["development", "production"];

const configs = [];
modes.forEach((mode) => bundlers.forEach((fn) => configs.push(fn(mode))));
export default configs;
