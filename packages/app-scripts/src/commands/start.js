const bootstrapShell = require('../lib/bootstrapShell');
const { reporter, exec } = require('@dhis2/cli-helpers-engine');
const concurrently = require('concurrently');
const makePaths = require('../lib/paths');

const handler = async ({ ...argv }) => {
  const shellDir = await bootstrapShell(argv);
  const paths = await makePaths(argv.cwd);

  reporter.info('Starting app shell...');
  try {
    await concurrently([{
      command: `yarn --cwd ${shellDir} run start`,
      name: 'Run',
      color: 'blue'
    }, {
      command: `yarn exec babel -- src --out-dir ${paths.devOut} --no-babelrc --config-file ${paths.babelConfig} --watch`,
      name: 'Compile',
      color: 'red'
    }], {
      killOthers: ['failure', 'failure']
    })
    // await exec({
    //   cmd: 'yarn',
    //   args: ['run', 'start'],
    //   cwd: shellDir,
    //   pipe: true
    // });
  } catch (err) {
    reporter.error('Start script exited with non-zero exit code');
    reporter.debugErr(err);
    process.exit(1);
  }
}

const command = {
  command: 'start',
  aliases: 's',
  desc: 'Start a development server running a DHIS2 app within the DHIS2 app-shell',
  handler
}

module.exports = command