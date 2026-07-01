// 1. Constants
var treeUtils = require('../tree-utils');
var select = require('./select');

// 2. Variable initialization — none

// 3. Main workflow function — showPosition

// Display current position and available actions
function showPosition(rl, state, onComplete) {
  var tags = treeUtils.getTags(state.currentNode);
  var tagDisplay = '';

  if (tags.length > 0) {
    tagDisplay = ' (tags: ' + tags.join(', ') + ')';
  } else if (state.currentNode === 'root') {
    tagDisplay = ' (root)';
  }

  var children = treeUtils.listChildren(state.currentNode);
  var parents = treeUtils.findAllParents(state.currentNode);

  console.log('Current: ' + state.currentNode + tagDisplay);
  console.log('');

  if (children.length > 0) {
    console.log('Children:');

    // Compute unique tags for each child
    var childUniqueTags = computeUniqueTagsPerChild(state.currentNode, children);

    for (var i = 0; i < children.length; i++) {
      var childName = children[i];
      var uniqueTags = childUniqueTags[childName] || [];
      console.log('  ' + childName + ' [' + uniqueTags.join(', ') + ']');
    }
    console.log('');
  }

  if (parents.length > 0) {
    console.log('Parents:');

    for (var j = 0; j < parents.length; j++) {
      var parentName = parents[j];
      var parentTags = treeUtils.getTags(parentName);

      if (parentTags.length > 0) {
        console.log('  ' + parentName + ' (child of: ' + parentTags.join(', ') + ')');
      } else {
        console.log('  ' + parentName);
      }
    }
    console.log('');
  }

  if (state.path.length > 0) {
    console.log('Path: ' + formatPath(state.path));
    console.log('');
  }

  console.log('Actions: type a unique tag to select child, type parent name to go up');
  console.log('  "down" to see children with tags, "up" to see parents');
  console.log('  "stop" to finish, "back" to undo');
  console.log('');

  rl.question('> ', function(input) {
    input = input.trim();
    var lower = input.toLowerCase();

    if (lower === 'stop') {
      select.finishNavigation(state, onComplete);
      return;
    }

    if (lower === 'back') {
      select.goBack(rl, state, onComplete);
      return;
    }

    if (lower === 'up') {
      select.showParentsForSelection(rl, state, onComplete);
      return;
    }

    if (lower === 'down') {
      select.showChildrenForSelection(rl, state, onComplete);
      return;
    }

    select.trySelectByTagOrName(rl, input, state, onComplete);
  });
}

// 4. Subworkflow functions

// Compute which tags are unique to each child under a parent
// Returns { childName: [uniqueTags], ... }
function computeUniqueTagsPerChild(parentName, children) {
  // Build tag frequency map across all children
  var tagCount = {};

  for (var i = 0; i < children.length; i++) {
    var childTags = treeUtils.getTags(children[i]);

    for (var t = 0; t < childTags.length; t++) {
      var tag = childTags[t];

      if (tagCount[tag] === undefined) {
        tagCount[tag] = 0;
      }

      tagCount[tag]++;
    }
  }

  // For each child, keep only tags with count === 1
  var result = {};

  for (var j = 0; j < children.length; j++) {
    var cName = children[j];
    var cTags = treeUtils.getTags(cName);
    var uniqueTags = [];

    for (var k = 0; k < cTags.length; k++) {
      if (tagCount[cTags[k]] === 1) {
        uniqueTags.push(cTags[k]);
      }
    }

    result[cName] = uniqueTags;
  }

  return result;
}

// Format path for display
function formatPath(path) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(path[i].direction + ' (' + path[i].tag + ')');
  }

  return parts.join(' -> ');
}

module.exports = {
  showPosition: showPosition,
  computeUniqueTagsPerChild: computeUniqueTagsPerChild,
  formatPath: formatPath
};
