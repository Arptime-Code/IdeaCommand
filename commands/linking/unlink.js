// 1. Constants
var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var getCurrentNode = require('../lib/navigate-state').getCurrentNode;
var validateName = require('../lib/validate-name');

// 2. Variable initialization — none

// 3. Main workflow function

function run(args) {
  if (args.length < 1) {
    return { success: false, error: 'Usage: ideaManager unlink <child>' };
  }

  var child = args[0];
  var parent = getCurrentNode();

  if (!parent) {
    return {
      success: false,
      error: 'No node selected. Use \'ideaManager navigate <name>\' first to select the parent.'
    };
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

// 4. Subworkflow functions — none

module.exports = { run: run };
