// 1. Constants
var treeUtils = require('../tree-utils');

// 2. Variable initialization — none

// 3. Main workflow function

// Resolve a tag-based path from startNode at compile time.
// contextParent is the known parent from the compile traversal.
// Up: verify parent's tags. Down: find unique child by tag.
function resolveValuePath(startNode, path, contextParent) {
  var currentNode = startNode;
  var previousNode = null;

  for (var stepIndex = 0; stepIndex < path.length; stepIndex++) {
    var step = path[stepIndex];
    previousNode = currentNode;

    if (step.direction === 'up') {
      // The known parent (from compile traversal) must have the expected tag
      if (!contextParent) {
        return { target: null, parent: null, error: 'Step ' + stepIndex + ': no parent context available for "' + currentNode + '".' };
      }

      if (!treeUtils.parentHasTag(contextParent, step.tag)) {
        var parentTags = treeUtils.getTags(contextParent);
        return {
          target: null,
          parent: null,
          error: 'Step ' + stepIndex + ': parent "' + contextParent + '" has tags [' + parentTags.join(', ') + '], expected tag "' + step.tag + '".'
        };
      }

      currentNode = contextParent;
      // Update contextParent for next step: now the parent of where we are
      contextParent = treeUtils.findParent(currentNode);
    } else if (step.direction === 'down') {
      var child = treeUtils.findChildByUniqueTag(currentNode, step.tag);

      if (!child) {
        return { target: null, parent: null, error: 'Step ' + stepIndex + ': no child with unique tag "' + step.tag + '" under "' + currentNode + '".' };
      }

      // The child's parent is the current node
      contextParent = currentNode;
      currentNode = child;
    } else {
      return { target: null, parent: null, error: 'Unknown direction: "' + step.direction + '".' };
    }
  }

  // For the parent, if the last step was "down", the parent is the node before the target.
  // If the last step was "up" or path is empty, use the target's own parent.
  var targetParent = previousNode || treeUtils.findParent(currentNode);
  return { target: currentNode, parent: targetParent, error: null };
}

// 4. Subworkflow functions — none

module.exports = {
  resolveValuePath: resolveValuePath
};
