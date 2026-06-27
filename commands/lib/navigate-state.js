// 1. Constants
var PATH = require('path');
var FS = require('fs');

var PROJECT_ROOT = PATH.resolve(__dirname, '..', '..');

// 2. Variable initialization — none

// 3. Main workflow functions

// Determine state directory from env var or project root
function getStateDir() {
  var envDir = process.env.IDEA_STATE_DIR;
  if (envDir) {
    return envDir;
  }
  return PROJECT_ROOT;
}

// Get path to the state file (computed at call time, not init time)
function getStateFile() {
  return PATH.join(getStateDir(), '.current-node.json');
}

// Read the current node from .current-node.json
// Return null if file is missing or invalid
function getCurrentNode() {
  try {
    var stateFile = getStateFile();
    var content = FS.readFileSync(stateFile, 'utf8');
    var data = JSON.parse(content);
    return data.currentNode || null;
  } catch (err) {
    return null;
  }
}

// Persist a node name as the current navigate target
function setCurrentNode(name) {
  var stateFile = getStateFile();
  var content = JSON.stringify({ currentNode: name });
  FS.writeFileSync(stateFile, content, 'utf8');
}

// Reset the current node to none
function clearCurrentNode() {
  var stateFile = getStateFile();
  var content = JSON.stringify({ currentNode: null });
  FS.writeFileSync(stateFile, content, 'utf8');
}

// 4. Subworkflow functions — none

module.exports = {
  getCurrentNode: getCurrentNode,
  setCurrentNode: setCurrentNode,
  clearCurrentNode: clearCurrentNode
};
