// 1. Constants

var getCurrentNode = require('../lib/navigate-state').getCurrentNode;
var contentRepl = require('./repl/repl');

// 2. Variable initialization — none

// 3. Main workflow function

// Entry point for 'ideaManager content'
// Checks navigate state, then starts the interactive content REPL
function run(args) {
  var currentNode = getCurrentNode();

  if (!currentNode) {
    return {
      success: false,
      error: 'No node selected. Use \'ideaManager navigate <name>\' first to select an idea.'
    };
  }

  // In REPL mode, share the REPL's readline instead of creating a conflicting one
  if (process.env.IDEA_REPL_MODE === 'true') {
    if (global.__ideaReplRl && global.__ideaReplHandler) {
      global.__ideaReplRl.removeListener('line', global.__ideaReplHandler);
      global.__ideaReplPaused = true;
    }

    contentRepl.startContentRepl(currentNode, global.__ideaReplRl, function() {
      if (global.__ideaReplRl && global.__ideaReplHandler) {
        global.__ideaReplRl.on('line', global.__ideaReplHandler);
        global.__ideaReplPaused = false;
        global.__ideaReplRl.prompt();
      }
    });
  } else {
    contentRepl.startContentRepl(currentNode);
  }

  // Keep process alive for the interactive REPL
  return { success: true };
}

// 4. Subworkflow functions — none

module.exports = { run: run };
