// 1. Constants
var FS = require('fs');

// 2. Variable initialization — none

// 3. Main workflow functions

var navigateState = require('../lib/navigate-state');
var validateName = require('../lib/validate-name');
var getIdeaDir = require('../lib/data-path').getIdeaDir;

function run(args) {
  // Show current node when called without arguments
  if (args.length === 0) {
    var current = navigateState.getCurrentNode();

    if (current) {
      console.log('Current node: ' + current);
    } else {
      console.log('No node selected. Usage: ideaManager navigate <name>');
    }

    return { success: true };
  }

  // Set the current node to the given name
  var name = args[0];
  var validationError = validateName(name);

  if (validationError) {
    return { success: false, error: validationError };
  }

  // Root is a special case — ensure its directory always exists
  if (name === 'root') {
    ensureRootExists();
  } else {
    // For any other idea, check that the directory exists
    var ideaDir = getIdeaDir(name);

    if (!FS.existsSync(ideaDir)) {
      return { success: false, error: 'Idea not found: ' + name };
    }
  }

  navigateState.setCurrentNode(name);
  console.log('Navigated to: ' + name);
  return { success: true };
}

// 4. Subworkflow functions

// Create the root idea directory if it doesn't exist
function ensureRootExists() {
  var rootDir = getIdeaDir('root');

  if (!FS.existsSync(rootDir)) {
    FS.mkdirSync(rootDir, { recursive: true });
    console.log('Root idea directory created');
  }
}

module.exports = { run: run };
