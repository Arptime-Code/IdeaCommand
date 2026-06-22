// 1. Constants
var PATH = require('path');
var FS = require('fs');

var PROJECT_ROOT = PATH.resolve(__dirname, '..', '..');

function getStateDir() {
  var envDir = process.env.IDEA_STATE_DIR;
  if (envDir) {
    return envDir;
  }
  return PROJECT_ROOT;
}

var STATE_FILE = PATH.join(getStateDir(), '.current-node.json');

// 2. Variable initialization — none

// 3. Main workflow functions

// Read the current node from .current-node.json
// Return null if file is missing or invalid
function getCurrentNode() {
  try {
    var content = FS.readFileSync(STATE_FILE, 'utf8');
    var data = JSON.parse(content);
    return data.currentNode || null;
  } catch (err) {
    return null;
  }
}

// Persist a node name as the current navigate target
function setCurrentNode(name) {
  var content = JSON.stringify({ currentNode: name });
  FS.writeFileSync(STATE_FILE, content, 'utf8');
}

// Reset the current node to none
function clearCurrentNode() {
  var content = JSON.stringify({ currentNode: null });
  FS.writeFileSync(STATE_FILE, content, 'utf8');
}

module.exports = {
  getCurrentNode: getCurrentNode,
  setCurrentNode: setCurrentNode,
  clearCurrentNode: clearCurrentNode
};
