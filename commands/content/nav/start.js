// 1. Constants
var showPosition = require('./show').showPosition;

// 2. Variable initialization — none

// 3. Main workflow function

// Start interactive value navigation from the given node.
// Builds a relative path by navigating up/down with tag selection.
// Calls onComplete(path) when user types "stop".
function startValueNavigation(rl, startNode, onComplete) {
  console.log('');
  console.log('--- Value Reference Builder ---');
  console.log('Navigate to the idea you want to reference.');
  console.log('Type "up" for parent level, "down" for children,');
  console.log('or a tag name to select that node.');
  console.log('Type "stop" to finish.');
  console.log('');

  var state = {
    currentNode: startNode,
    path: [],
    visitedNodes: [startNode]
  };

  showPosition(rl, state, onComplete);
}

module.exports = {
  startValueNavigation: startValueNavigation
};
