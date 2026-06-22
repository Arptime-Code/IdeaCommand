var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var validateName = require('../lib/validate-name');

function run(args) {
  if (args.length < 2) {
    return { success: false, error: 'Usage: ideaManager unlink <parent> <child>' };
  }

  var parent = args[0];
  var child = args[1];

  var parentError = validateName(parent);
  if (parentError) {
    return { success: false, error: parentError };
  }

  var childError = validateName(child);
  if (childError) {
    return { success: false, error: childError };
  }

  var parentDir = getIdeaDir(parent);
  var contentPath = PATH.join(parentDir, child + '.json');

  if (!FS.existsSync(contentPath)) {
    return { success: false, error: 'Content not found: ' + parent + ' -> ' + child };
  }

  try {
    FS.unlinkSync(contentPath);
  } catch (err) {
    return { success: false, error: 'Error removing content: ' + err.message };
  }

  console.log('Unlinked ' + child + ' from ' + parent);
  return { success: true };
}

module.exports = { run: run };
