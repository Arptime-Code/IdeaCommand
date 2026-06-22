// 1. Constants
var FS = require('fs');

// 2. Variable initialization

var getCurrentNode = require('../lib/navigate-state').getCurrentNode;
var store = require('./content-store');
var treeUtils = require('./tree-utils');
var getIdeaDir = require('../lib/data-path').getIdeaDir;

// 3. Main workflow function

// Entry point for 'ideaManager compile'
// Walks the idea tree from the current node and prints only the raw text content
// Entries are concatenated directly — no automatic newlines between entries
function run(args) {
  var currentNode = getCurrentNode();

  if (!currentNode) {
    return {
      success: false,
      error: 'No node selected. Use \'ideaManager navigate <name>\' first.'
    };
  }

  var output = { value: '' };
  var errors = [];
  var visited = {};

  compileNode(currentNode, null, output, errors, visited);

  if (output.value.length > 0) {
    console.log(output.value);
  }

  if (errors.length > 0) {
    console.log('');
    console.log('Compilation errors:');
    for (var e = 0; e < errors.length; e++) {
      console.log('  ' + errors[e]);
    }
    return { success: false, error: 'Compilation completed with ' + errors.length + ' error(s).' };
  }

  return { success: true };
}

// 4. Subworkflow functions

// Recursively walk the tree and collect text content into output
// All entries are concatenated directly — no automatic newlines added
function compileNode(nodeName, parentName, output, errors, visited) {
  if (visited[nodeName]) {
    return;
  }

  visited[nodeName] = true;

  // Load this node's content from its parent's directory
  var contentSource = parentName || treeUtils.findParent(nodeName);

  if (contentSource) {
    var data = store.loadContent(contentSource, nodeName);

    for (var j = 0; j < data.entries.length; j++) {
      var entry = data.entries[j];

      if (entry.type === 'text') {
        output.value = output.value + entry.content;
      } else if (entry.type === 'value-from-node') {
        compileValueFromNode(entry, output, errors, visited);
      }
    }
  }

  // Recurse into children
  var children = treeUtils.listChildren(nodeName);

  for (var k = 0; k < children.length; k++) {
    compileNode(children[k], nodeName, output, errors, visited);
  }
}

// Resolve a value-from-node reference and collect its content
function compileValueFromNode(entry, output, errors, visited) {
  var targetParent = entry.parentName;
  var targetChild = entry.childName;

  // Check if the referenced child idea directory exists
  var refChildDir = getIdeaDir(targetChild);
  if (!FS.existsSync(refChildDir)) {
    errors.push('Reference to "' + targetParent + '/' + targetChild + '": idea "' + targetChild + '" not found.');
    return;
  }

  // Check if the direct parent-child link exists
  if (treeUtils.childExists(targetParent, targetChild)) {
    compileNode(targetChild, targetParent, output, errors, visited);
    return;
  }

  // Direct link missing — search parent's subtree for the child
  var found = searchSubtree(targetParent, targetChild);

  if (found) {
    compileNode(targetChild, found, output, errors, visited);
  } else {
    errors.push('Reference to "' + targetParent + '/' + targetChild + '": "' + targetChild + '" is no longer under "' + targetParent + '".');
  }
}

// Recursively search parent's subtree for a child by name
function searchSubtree(parentName, childName) {
  var children = treeUtils.listChildren(parentName);

  for (var i = 0; i < children.length; i++) {
    var child = children[i];

    if (child === childName) {
      return parentName;
    }

    var found = searchSubtree(child, childName);
    if (found) {
      return found;
    }
  }

  return null;
}

module.exports = { run: run };
