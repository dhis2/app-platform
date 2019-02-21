const path = require('path');
const webpack = require('webpack');
const webpackConfigBuilder = require('../../config/webpack.configBuilder');
const { reporter } = require('@dhis2/cli-helpers-engine');
const fs = require('fs-extra');

const compile = ({ paths, mode = 'development', watch = false } = {}) => {
  reporter.debug('Initializing webpack compiler...');

  const outputDir = paths.devOut;

  const compiler = webpack(webpackConfigBuilder({
    name: 'DHIS2App',
    entry: paths.appEntry,
    mode,
    outputDir,
    outputFilename: paths.appOutputFilename
  }));

  reporter.debug('Running webpack compiler...');
  return new Promise(async (resolve, reject) => {
    await fs.remove(outputDir);
    if (watch) {
      compiler.watch({
        aggregateTimeout: 300,
      }, (err, stats) => {
        reporter.print(stats);
        if (err) {
          reject('An error occurred during compilation');
        }
      });
    } else {
      compiler.run((err, stats) => {
        reporter.print(stats);
        if (err) {
          reject('An error occurred during compilation');
        } else if (stats.hasErrors()) {
          reject('Compilation failed');
        } else {
          resolve(stats);
        }
      })
    }
  });
}

module.exports = compile;