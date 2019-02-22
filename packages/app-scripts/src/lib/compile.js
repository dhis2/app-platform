const path = require('path');
const webpack = require('webpack');
const webpackConfigBuilder = require('../../config/webpack.configBuilder');
const { reporter } = require('@dhis2/cli-helpers-engine');
const fs = require('fs-extra');
const gaze = require('gaze');

const babel = require("@babel/core");

const babelCompile = async (file, dest) => {
  try {
    const result = await babel.transformFileAsync(file, require('../../config/babel.config'));
    await fs.writeFile(dest, result.code);
  } catch (e) {
    reporter.error(`Transpilation error <${path.basename(file)}: ${e}`);
  }
}

const walkTree = async (tree, cb) => {
  const promises = [];
  Object.keys(tree).forEach(dir => {
    tree[dir].forEach(name => {
      if (name[name.length - 1] !== '/' && name[name.length - 1] !== '\\') {
        promises.push(cb(name));
      }
    });
  });
  await Promise.all(promises);
}

const compile = async ({ paths, mode = 'development', watch = false } = {}) => {
  const outputDir = paths.shellApp;

  reporter.info(`Copying ${paths.src} to ${outputDir}`);

  fs.removeSync(outputDir);
  fs.ensureDirSync(outputDir);

  await fs.copy(paths.src, outputDir);

  if (watch) {
    return new Promise((resolve, reject) => {
      gaze(`${paths.src}/**/*`, async function (err, watcher) {
        if (err) {
          reject(err);
        }

        this.on('all', async (event, f) => {
          const dest = f && path.join(outputDir, path.relative(paths.src, f));
          reporter.debug(`Gaze event ${event} - ${f} -> ${dest}`);
          
          switch (event) {
            case 'added':
              await fs.ensureDir(path.dirname(f));
              await fs.copyFile(f, dest);
              break;
            case 'changed':
              await fs.remove(dest);
              await fs.copyFile(f, dest, { overwrite: true });
              break;
            case 'removed':
              await fs.remove(dest);
              break;
            default:
              return;
          }
        });
      });
    });
  }

  // reporter.debug('Initializing webpack compiler...');
  // const compiler = webpack(webpackConfigBuilder({
  //   name: 'DHIS2App',
  //   entry: paths.appEntry,
  //   mode,
  //   outputDir,
  //   outputFilename: paths.appOutputFilename
  // }));

  // reporter.debug('Running webpack compiler...');
  // return new Promise(async (resolve, reject) => {
  //   await fs.remove(outputDir);
  //   if (watch) {
  //     reporter.debug('Watching files for changes...');
  //     compiler.watch({
  //       aggregateTimeout: 300,
  //     }, (err, stats) => {
  //       reporter.debug('File change detected!');
  //       reporter.print(stats);
  //       if (err) {
  //         reject('An error occurred during compilation');
  //       }
  //     });
  //   } else {
  //     compiler.run((err, stats) => {
  //       reporter.print(stats);
  //       if (err) {
  //         reject('An error occurred during compilation');
  //       } else if (stats.hasErrors()) {
  //         reject('Compilation failed');
  //       } else {
  //         resolve(stats);
  //       }
  //     })
  //   }
  // });
}

module.exports = compile;