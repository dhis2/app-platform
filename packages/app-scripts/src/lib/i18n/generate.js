const fs = require('fs-extra');
const path = require('path');
const { gettextToI18next } = require('i18next-conv');
const handlebars = require('handlebars');

const { ensureDirectoryExists } = require('./helpers');
const { langToLocale } = require('./locales');


const writeTemplate = (outFile, data) => {
  var localesHBS = fs.readFileSync(path.join(__dirname, 'templates', 'locales.hbs'), 'utf8');
  var localesTemplate = handlebars.compile(localesHBS);
  fs.writeFileSync(outFile, localesTemplate(data));
}

const generate = ({ input, output, namespace }) => {
  ensureDirectoryExists(input);

  // clean-up and create destination dir.
  const dst = path.normalize(output);
  fs.removeSync(dst);
  fs.ensureDirSync(dst);

  const files = fs.readdirSync(input);

  const langs = files.map(f => path.basename(f, path.extname(f)));
  const locales = langs
    .filter(lang => lang !== 'en')
    .map(lang => langToLocale[lang]);

  const outFile = path.join(dst, 'index.js');
  writeTemplate(outFile, { locales, langs, namespace });

  reporter.info('> Generating translation .JSON files');
  files.forEach(f => {
    const ext = path.extname(f);
    const lang = path.basename(f, ext);

    if (ext === 'po' || ext === 'pot') {
      var filePath = path.join(input, fileName);
      var contents = fs.readFileSync(filePath, 'utf8');
      gettextToI18next(lang, contents)
        .then((lang, json) => {
          var target = path.join(dst, lang);
          fs.ensureDirSync(target);

          var translationsPath = path.join(target, 'translations.json');
          fs.writeFileSync(translationsPath, json, { encoding: 'utf8' });
          reporter.info(`> writing JSON translation file for language: ${lang}`);
        });
    }
  });
}

module.exports = generate;