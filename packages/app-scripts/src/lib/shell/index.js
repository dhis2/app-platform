const { reporter, exec } = require('@dhis2/cli-helpers-engine');
const bootstrap = require('./bootstrap');
const fs = require('fs-extra');

module.exports = paths => ({
  bootstrap: async ({ force } = {}) => {
    await bootstrap(paths, { force })
    if (force) {
      reporter.info('Linking app into appShell');
      await fs.symlink(paths.devOut, paths.shellApp);
    }
  },
  // link: async srcPath => {
  //   reporter.info('Linking app into appShell');
  //   await fs.symlink(srcPath, paths.shellApp);
  // },
  build: async () => {
    await exec({
      cmd: 'yarn',
      args: ['run', 'build'],
      cwd: paths.shell,
      pipe: false
    });
  },
  start: async () => {
    await exec({
      cmd: 'yarn',
      args: ['run', 'start'],
      cwd: paths.shell,
      pipe: false
    });
  }
})