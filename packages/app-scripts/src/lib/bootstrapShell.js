const makePaths = require('./paths');
const fs = require('fs-extra');
const { reporter, exec } = require('@dhis2/cli-helpers-engine');

const bootstrapShell = async ({ cwd, force }) => {
  const paths = makePaths(cwd);
  const source = paths.shellSource,
        dest = paths.shell;
  reporter.debug(`Bootstrapping appShell from ${source} to ${dest}`)

  if (fs.pathExistsSync(dest)) {
    if (!force) {
      reporter.info('An existing version of the appShell exists, skipping bootstrap...');
      return dest;
    }
    reporter.info('Removing existing directory')
    await fs.remove(dest);
  }

  await fs.ensureDir(dest);

  reporter.info('Copying appShell to temporary directory...');
  try {
    await fs.copy(source, dest, { 
      dereference: true,
      filter: src => 
        src.indexOf('node_modules', source.length) === -1 &&
        src.indexOf(paths.shellAppDirname) === -1
    });
  } catch (err) {
    reporter.error(err);
    process.exit(1);
  }

  reporter.info('Installing dependencies');
  try {
    await exec({
      cmd: 'yarn',
      args: ['install', '--frozen-lockfile'],
      cwd: dest
    });
  } catch (err) {
    reporter.error('Yarn install failed');
    process.exit(1);
  }

  reporter.info('Linking app into appShell');
  await fs.symlink(paths.devOut, paths.shellApp);

  return dest;
};

module.exports = bootstrapShell;