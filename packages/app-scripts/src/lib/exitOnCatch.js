const { reporter } = require("@dhis2/cli-helpers-engine");

const exitOnCatch = async (fn, { name, onError, code=1 } = {}) => {
  const fnName = name || fn.name || 'unknown';
  try {
    return await fn();
  } catch (err) {
    if (onError) {
      await onError(err);
    }
    reporter.debugErr(`Failed in async try/catch of function ${fnName}`);
    reporter.debugErr(`Error: ${err}`);
    process.exit(code);
  }
}

module.exports = exitOnCatch;