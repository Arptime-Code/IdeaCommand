var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var validateName = require('../lib/validate-name');

function run(args) {
  if (args.length < 2) {
    return { success: false, error: 'Usage: ideaManager link <parent> <child>' };
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

  if (!FS.existsSync(parentDir)) {
    return { success: false, error: 'Parent idea not found: ' + parent };
  }

  var contentPath = PATH.join(parentDir, child + '.json');

  try {
    FS.writeFileSync(contentPath, JSON.stringify({ entries: [] }, null, 2));
  } catch (err) {
    return { success: false, error: 'Error creating content file: ' + err.message };
  }

  console.log('Linked ' + child + ' under ' + parent);
  return { success: true };
}

module.exports = { run: run };
