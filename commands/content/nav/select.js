// 1. Constants
var treeUtils = require('../tree-utils');
var show = require('./show');

// 2. Variable initialization — none

// 3. Main workflow functions — entry point is goBack or showParentsForSelection

// Show all parents and let user pick one
function showParentsForSelection(rl, state, onComplete) {
  var parents = treeUtils.findAllParents(state.currentNode);

  if (parents.length === 0) {
    console.log('No parents found for "' + state.currentNode + '".');

    if (state.currentNode === 'root') {
      console.log('You are already at root.');
    }

    show.showPosition(rl, state, onComplete);
    return;
  }

  console.log('');
  console.log('--- Parents of ' + state.currentNode + ' ---');

  for (var i = 0; i < parents.length; i++) {
    var parentName = parents[i];
    var parentTags = treeUtils.getTags(parentName);

    if (parentTags.length > 0) {
      console.log('  ' + parentName + ' (child of: ' + parentTags.join(', ') + ')');
    } else {
      console.log('  ' + parentName);
    }
  }

  console.log('');
  console.log('Type the PARENT NAME to select it.');
  console.log('');

  rl.question('Parent name: ', function(input) {
    input = input.trim();

    if (input.toLowerCase() === 'back') {
      show.showPosition(rl, state, onComplete);
      return;
    }

    // Find the parent by name
    var foundParent = null;

    for (var j = 0; j < parents.length; j++) {
      if (parents[j] === input) {
        foundParent = parents[j];
        break;
      }
    }

    if (!foundParent) {
      console.log('No parent named "' + input + '".');
      showParentsForSelection(rl, state, onComplete);
      return;
    }

    // Store the step with one of the parent's tags as verification
    var parentTags = treeUtils.getTags(foundParent);
    var tagForPath = parentTags.length > 0 ? parentTags[0] : '';

    // Special case: if contextParent is root and parent has no tags,
    // use the parent's own name as the tag for backward compat
    if (!tagForPath) {
      tagForPath = foundParent;
    }

    state.path.push({ direction: 'up', tag: tagForPath });
    state.visitedNodes.push(foundParent);
    state.currentNode = foundParent;
    console.log('Moved up to: ' + foundParent);
    console.log('');
    show.showPosition(rl, state, onComplete);
  });
}

// Show all children with their unique tags and let user pick one
function showChildrenForSelection(rl, state, onComplete) {
  var children = treeUtils.listChildren(state.currentNode);

  if (children.length === 0) {
    console.log('No children found for "' + state.currentNode + '".');
    show.showPosition(rl, state, onComplete);
    return;
  }

  console.log('');
  console.log('--- Children of ' + state.currentNode + ' ---');

  var childUniqueTags = show.computeUniqueTagsPerChild(state.currentNode, children);

  for (var i = 0; i < children.length; i++) {
    var childName = children[i];
    var uniqueTags = childUniqueTags[childName] || [];
    console.log('  ' + childName + ' [' + uniqueTags.join(', ') + ']');
  }

  console.log('');
  console.log('Type a UNIQUE TAG to select that child.');
  console.log('');

  rl.question('Unique tag: ', function(input) {
    input = input.trim();

    if (input.toLowerCase() === 'back') {
      show.showPosition(rl, state, onComplete);
      return;
    }

    // Find which child has this as a unique tag
    var foundChild = null;

    for (var j = 0; j < children.length; j++) {
      var cName = children[j];
      var uniqueTags = childUniqueTags[cName] || [];

      for (var k = 0; k < uniqueTags.length; k++) {
        if (uniqueTags[k] === input) {
          foundChild = cName;
          break;
        }
      }

      if (foundChild) {
        break;
      }
    }

    if (!foundChild) {
      console.log('No child has unique tag "' + input + '".');
      showChildrenForSelection(rl, state, onComplete);
      return;
    }

    state.path.push({ direction: 'down', tag: input });
    state.visitedNodes.push(foundChild);
    state.currentNode = foundChild;
    console.log('Moved down to: ' + foundChild);
    console.log('');
    show.showPosition(rl, state, onComplete);
  });
}

// 4. Subworkflow functions

// Try to match input as a child's unique tag or a parent name
function trySelectByTagOrName(rl, input, state, onComplete) {
  // Check children first by unique tag
  var children = treeUtils.listChildren(state.currentNode);
  var childUniqueTags = show.computeUniqueTagsPerChild(state.currentNode, children);

  for (var i = 0; i < children.length; i++) {
    var cName = children[i];
    var uniqueTags = childUniqueTags[cName] || [];

    for (var t = 0; t < uniqueTags.length; t++) {
      if (uniqueTags[t] === input) {
        state.path.push({ direction: 'down', tag: input });
        state.visitedNodes.push(cName);
        state.currentNode = cName;
        console.log('Selected child: ' + cName);
        console.log('');
        show.showPosition(rl, state, onComplete);
        return;
      }
    }
  }

  // Check parents by name
  var parents = treeUtils.findAllParents(state.currentNode);

  for (var j = 0; j < parents.length; j++) {
    if (parents[j] === input) {
      // Store step with one of the parent's tags as verification
      var parentTags = treeUtils.getTags(parents[j]);
      var tagForPath = parentTags.length > 0 ? parentTags[0] : parents[j];

      state.path.push({ direction: 'up', tag: tagForPath });
      state.visitedNodes.push(parents[j]);
      state.currentNode = parents[j];
      console.log('Selected parent: ' + parents[j]);
      console.log('');
      show.showPosition(rl, state, onComplete);
      return;
    }
  }

  console.log('No child with unique tag "' + input + '" and no parent named "' + input + '".');
  show.showPosition(rl, state, onComplete);
}

// Undo the last navigation step
function goBack(rl, state, onComplete) {
  if (state.path.length === 0) {
    console.log('No steps to undo.');
    show.showPosition(rl, state, onComplete);
    return;
  }

  state.path.pop();
  state.visitedNodes.pop();

  // Restore previous node from visitedNodes stack
  var prevNode = state.visitedNodes[state.visitedNodes.length - 1];

  if (prevNode) {
    state.currentNode = prevNode;
  } else {
    // Should not happen — visitedNodes always has at least the start node
    state.visitedNodes = [state.currentNode];
  }

  console.log('Undid last step.');
  show.showPosition(rl, state, onComplete);
}

// Finish navigation and return the built path
function finishNavigation(state, onComplete) {
  onComplete(state.path);
}

module.exports = {
  showParentsForSelection: showParentsForSelection,
  showChildrenForSelection: showChildrenForSelection,
  trySelectByTagOrName: trySelectByTagOrName,
  goBack: goBack,
  finishNavigation: finishNavigation
};
