const { reporter } = require('@dhis2/cli-helpers-engine');

const compile = require('../lib/compile');
const makePaths = require('../lib/paths');
const makeShell = require('../lib/shell');
const exitOnCatch = require('../lib/exitOnCatch');

const handler = async ({ cwd }) => {
  const paths = makePaths(cwd);
  
  const shell = makeShell(paths);
  await shell.bootstrap();

  reporter.info('Starting app shell...');

  exitOnCatch(async () => {
    const compilePromise = compile({ paths, watch: true });
    const startPromise = shell.start();
    await Promise.all([compilePromise, startPromise]);
    process.exit(1);
  }, {
    name: 'start',
    onError: () => reporter.error('Start script exited with non-zero exit code')
  });
}

const command = {
  command: 'start',
  aliases: 's',
  desc: 'Start a development server running a DHIS2 app within the DHIS2 app-shell',
  handler
}

module.exports = command