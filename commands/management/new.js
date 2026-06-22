// 1. Constants — none

// 2. Variable initialization — none

// 3. Main workflow function

var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var validateName = require('../lib/validate-name');
var getCurrentNode = require('../lib/navigate-state').getCurrentNode;
var askQuestions = require('./questions').askQuestions;
var addPotentialIdea = require('./potential').addPotentialIdea;

function run(args) {
  if (args.length === 0) {
    return { success: false, error: 'Usage: ideaManager new <name>' };
  }

  var name = args[0];
  var validationError = validateName(name);

  if (validationError) {
    return { success: false, error: validationError };
  }

  var parent = getCurrentNode();

  if (!parent) {
    return {
      success: false,
      error: 'No node selected. Use \'ideaManager navigate <name>\' first to select a parent idea.'
    };
  }

  // Check if idea already exists before asking questions
  var ideaDir = getIdeaDir(name);
  if (FS.existsSync(ideaDir)) {
    return { success: false, error: 'Idea already exists: ' + name };
  }

  var isRepl = process.env.IDEA_REPL_MODE === 'true';

  // Prepare callbacks for question answers
  var callbacks;

  if (isRepl) {
    // In REPL mode: detach the REPL's line handler so questions can use its readline
    if (global.__ideaReplRl && global.__ideaReplHandler) {
      global.__ideaReplRl.removeListener('line', global.__ideaReplHandler);
      global.__ideaReplPaused = true;
    }

    callbacks = {
      onAllYes: function() {
        var outcome = createIdeaWithLink(name, parent);
        if (!outcome.success && outcome.error) {
          console.log(outcome.error);
        }
        resumeRepl();
      },
      onStop: function() {
        resumeRepl();
      },
      onSavePotential: function(ideaName) {
        addPotentialIdea(ideaName);
        console.log('Saved "' + ideaName + '" as a potential idea.');
        resumeRepl();
      }
    };

    askQuestions(name, parent, callbacks, global.__ideaReplRl);
  } else {
    callbacks = {
      onAllYes: function() {
        var outcome = createIdeaWithLink(name, parent);
        if (!outcome.success && outcome.error) {
          console.log(outcome.error);
          process.exit(1);
        }
        process.exit(0);
      },
      onStop: function() {
        process.exit(0);
      },
      onSavePotential: function(ideaName) {
        addPotentialIdea(ideaName);
        console.log('Saved "' + ideaName + '" as a potential idea.');
        process.exit(0);
      }
    };

    askQuestions(name, parent, callbacks);
  }

  // Keep the process alive for the interactive questions
  return { success: true };
}

// Re-attach REPL line handler and prompt
function resumeRepl() {
  if (global.__ideaReplRl && global.__ideaReplHandler) {
    global.__ideaReplRl.on('line', global.__ideaReplHandler);
    global.__ideaReplPaused = false;
    global.__ideaReplRl.prompt();
  }
}

// 4. Subworkflow functions

// Create idea directory and link under parent
// Returns { success: true } or { success: false, error: "..." }
function createIdeaWithLink(name, parent) {
  var parentDir = getIdeaDir(parent);

  // Check parent exists before creating child
  if (!FS.existsSync(parentDir)) {
    return { success: false, error: 'Parent idea not found: ' + parent };
  }

  var ideaDir = getIdeaDir(name);

  if (FS.existsSync(ideaDir)) {
    return { success: false, error: 'Idea already exists: ' + name };
  }

  try {
    FS.mkdirSync(ideaDir, { recursive: true });
  } catch (err) {
    return { success: false, error: 'Error creating idea: ' + err.message };
  }

  var contentPath = PATH.join(parentDir, name + '.json');

  try {
    FS.writeFileSync(contentPath, JSON.stringify({ entries: [] }, null, 2));
  } catch (err) {
    return { success: false, error: 'Error creating content file: ' + err.message };
  }

  console.log('Created idea: ' + name + ' under ' + parent);
  return { success: true };
}

module.exports = { run: run };
