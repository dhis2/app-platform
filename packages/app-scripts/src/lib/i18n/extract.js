const fs = require('fs-extra');
const { ensureDirectoryExists, walkDirectory } = require('./helpers');
const { reporter } = require('@dhis2/cli-helpers-engine');
const scanner = require('i18next-scanner');
const { i18nextToPot, gettextToI18next } = require('i18next-conv');

const extract = async ({ input, output }) => {
  ensureDirectoryExists(input);

  reporter.info(`> reading ${dirPath}`);

  const files = walkDirectory(dirPath);
  if (files.length === 0) {
    reporter.error(`${dirPath} has no strings to translate.`);
    process.exit(1);
  }

  var parser = new scanner.Parser({
    keepRemoved: false,
    keySeparator: false,
    sort: true
  });

  reporter.info(`> parsing ${files.length} 'files'`);
  
  files.forEach(filePath => {
    var contents = fs.readFileSync(filePath, 'utf8');
    parser.parseFuncFromString(contents).get();
  });

  var parsed = parser.get();
  var en = {};

  Object.keys(parsed.en.translation).forEach(str => (en[str] = ''));

  var targetPath = path.join(output, 'en.pot');

  // var checkExisting = true;
  // if (!fs.existsSync(output)) {
  //   (checkExisting = false), fs.mkdirSync(output);
  //   fs.closeSync(fs.openSync(targetPath, 'w'));
  // }

  if (fs.existsSync(output)) {
    // validate, diff translation keys b/w en.pot vs now
    const json = await gettextToI18next('en', fs.readFileSync(targetPath, 'utf8'))
    
    var msgIds = Object.keys(en);
    var newMsgIds = Object.keys(JSON.parse(json));

    if (arrayEqual(newMsgIds, msgIds)) {
      console.log('> no i18n updates found.');
      console.log('> complete\n');
      return
    }
  }
  
  reporter.info(`> writing: ${Object.keys(strings).length} language strings to ${targetPath}`);
  const result = await i18nextToPot('en', JSON.stringify(en))

  fs.writeFileSync(targetPath, result + "\n");
  reporter.info('> complete');
}

module.exports = extract;