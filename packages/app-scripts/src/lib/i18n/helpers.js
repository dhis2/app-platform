const { reporter } = require('@dhis2/cli-helpers-engine');
const fs = require('fs-extra');
var path = require('path');

var supportedExtensions = ['.js', '.jsx', '.ts', '.tsx'];

module.exports.ensureDirectoryExists = dir => {
  try {
    var dirPath = path.normalize(input);
    var stat = fs.lstatSync(dirPath);

    if (!stat.isDirectory()) {
      reporter.error(`${dirPath} is not a directory.`);
      process.exit(1);
    }
  } catch (e) {
    reporter.error(`${dirPath} does not exist.`);
    process.exit(1);
  }
}

// src from component/array-equal
module.exports.arrayEqual = (arr1, arr2) => {
  var length = arr1.length;
  if (length !== arr2.length) return false;
  for (var i = 0; i < length; i++) if (arr1[i] !== arr2[i]) return false;
  return true;
}

function walkDirectory(dirPath, files = []) {
  const list = fs.readdirSync(dirPath);

  list.forEach(fileName => {
    const filePath = path.join(dirPath, fileName);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, files);
    } else if (stat.isFile() && !stat.isSymbolicLink()) {
      const ext = path.extname(fileName);

      if (supportedExtensions.includes(ext)) {
        files.push(filePath);
      }
    }
  });

  return files;
};

module.exports.walkDirectory = walkDirectory;