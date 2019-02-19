const bootstrapShell = require('../lib/bootstrapShell');
const { reporter, exec } = require('@dhis2/cli-helpers-engine');
const makePaths = require('../lib/paths');
const fs = require('fs-extra')

const handler = async ({ ...argv }) => {
  const shellDir = await bootstrapShell(argv);
  const paths = await makePaths(argv.cwd);

  reporter.info('Building app...');
  try {
    await exec({
      cmd: 'yarn',
      args: ['exec', 'babel', '--', 'src', '--out-dir', paths.devOut, '--no-babelrc', '--config-file', paths.babelConfig],
      pipe: true
    })
    await exec({
      cmd: 'yarn',
      args: ['run', 'build'],
      cwd: shellDir,
      pipe: true
    });
  } catch (err) {
    reporter.error('Build script exited with non-zero exit code');
    reporter.debugErr(err);
    process.exit(1);
  }

  console.log(paths.shellBuildOutput);
  if (!fs.pathExistsSync(paths.shellBuildOutput)) {
    reporter.error('No build output found');
    process.exit(1);
  }

  if (fs.pathExistsSync(paths.buildOutput)) {
    await fs.remove(paths.buildOutput);
  }
  await fs.copy(paths.shellBuildOutput, paths.buildOutput);
}

const command = {
  command: 'build',
  aliases: 'b',
  desc: 'Build a production app bundle for use with the DHIS2 app-shell in production',
  handler
}

module.exports = command
