const { reporter } = require('@dhis2/cli-helpers-engine');

const fs = require('fs-extra')
const chalk = require('chalk');

const i18n = require('../lib/i18n');
const compile = require('../lib/compile');
const makePaths = require('../lib/paths');
const makeShell = require('../lib/shell');
const exitOnCatch = require('../lib/exitOnCatch');

const handler = async ({ cwd, force }) => {
  const paths = makePaths(cwd);
  
  const shell = makeShell(paths);
  await shell.bootstrap({ force });

  exitOnCatch(async () => {
    reporter.info('Generating internationalization strings...');
    await i18n.extract({ input: paths.src, output: paths.i18nStrings });
    await i18n.generate({ input: paths.i18nStrings, output: paths.i18nLocales, namespace: 'default' });
    
    reporter.info('Building app...');
    const mode = 'production';
    await compile({ paths, mode });
    reporter.info(` - Built in mode ${chalk.bold(mode)}`);

    reporter.info('Building appShell...');
    await shell.build()
    reporter.info(` - Built in mode ${chalk.bold(mode)}`);
  }, {
    name: 'build',
    onError: () => reporter.error('Build script failed')
  });

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
  aliases: 'b',
  desc: 'Build a production app bundle for use with the DHIS2 app-shell in production',
  handler
}

module.exports = command
