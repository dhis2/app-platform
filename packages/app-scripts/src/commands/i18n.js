const { namespace } = require('@dhis2/cli-helpers-engine');
const i18n = require('../lib/i18n');

const commonOptions = {
  'path': {
    description: 'Directory path to recurse and extract i18n.t translation strings',
    default: './src/',
  },
  'output': {
    description: 'Destination path for en.pot file',
    default: './i18n/'
  }
}

const generate = {
  description: 'Generate JSON files compatible with i18next from po/pot files',
  builder: {
    ...commonOptions,
    namespace: {
      description: 'Namespace for app locale separation',
      required: true
    }
  }
}
const extract = {
  description: 'Extract strings-to-translate',
  builder: {
    ...commonOptions
  },
  handler: async argv => {
    await i18n.extract({ input: argv.path, output: argv.output });
  }
}

module.exports = namespace('i18n', {
  description: 'Extract i18n.t translation strings from DHIS2 frontend apps',
  commands: [ extract, generate, check ]
});