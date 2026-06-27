// 1. Constants
var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var getDataDir = require('../lib/data-path').getDataDir;
var validateName = require('../lib/validate-name');

// 2. Variable initialization — none

// 3. Main workflow function

function run(args) {
  if (args.length === 0) {
    return {
      success: false,
      error: 'Usage: ideaManager remove <name>  or  ideaManager remove <parent> <child>'
    };
  }

  // Two arguments: remove only the child instance under the given parent
  if (args.length >= 2) {
    return removeChildInstance(args[0], args[1]);
  }

  // One argument: remove the entire node and all its instances
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

// 4. Subworkflow functions

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

// Remove only the child instance file under a specific parent.
// Does not touch the child's own node folder or other instances.
function removeChildInstance(parentName, childName) {
  var parentError = validateName(parentName);
  if (parentError) {
    return { success: false, error: parentError };
  }

  var childError = validateName(childName);
  if (childError) {
    return { success: false, error: childError };
  }

  var parentDir = getIdeaDir(parentName);

  if (!FS.existsSync(parentDir)) {
    return { success: false, error: 'Parent idea not found: ' + parentName };
  }

  var instancePath = PATH.join(parentDir, childName + '.json');

  if (!FS.existsSync(instancePath)) {
    return {
      success: false,
      error: 'Child instance not found: ' + parentName + ' -> ' + childName
    };
  }

  FS.unlinkSync(instancePath);
  console.log('Removed instance of ' + childName + ' under ' + parentName);
  return { success: true };
}

function removeLinksTo(ideaName) {
  var dataDir = getDataDir();

  if (!FS.existsSync(dataDir)) {
    return;
  }

  var entries = FS.readdirSync(dataDir);

  for (var i = 0; i < entries.length; i++) {
    var linkPath = PATH.join(dataDir, entries[i], ideaName + '.json');

    if (FS.existsSync(linkPath)) {
      FS.unlinkSync(linkPath);
    }
  }
}

module.exports = { run: run };
