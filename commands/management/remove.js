var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var getDataDir = require('../lib/data-path').getDataDir;
var validateName = require('../lib/validate-name');

function run(args) {
  if (args.length === 0) {
    return { success: false, error: 'Usage: ideaManager remove <name>' };
  }

  var name = args[0];
  var validationError = validateName(name);
  if (validationError) {
    return { success: false, error: validationError };
  }

  var ideaDir = getIdeaDir(name);

  if (!FS.existsSync(ideaDir)) {
    return { success: false, error: 'Idea not found: ' + name };
  }

  removeDirectorySync(ideaDir);
  removeLinksTo(name);

  console.log('Removed idea: ' + name);
  return { success: true };
}

function removeDirectorySync(dirPath) {
  var entries = FS.readdirSync(dirPath);

  for (var i = 0; i < entries.length; i++) {
    var entryPath = PATH.join(dirPath, entries[i]);
    var stat = FS.statSync(entryPath);

    if (stat.isDirectory()) {
      removeDirectorySync(entryPath);
    } else {
      FS.unlinkSync(entryPath);
    }
  }

  FS.rmdirSync(dirPath);
}

function removeLinksTo(ideaName) {
  var dataDir = getDataDir();

  if (!FS.existsSync(dataDir)) {
    return;
  }

  var entries = FS.readdirSync(dataDir);

  for (var i = 0; i < entries.length; i++) {
    var linkPath = PATH.join(dataDir, entries[i], ideaName + '.txt');

    if (FS.existsSync(linkPath)) {
      FS.unlinkSync(linkPath);
    }
  }
}

module.exports = { run: run };
