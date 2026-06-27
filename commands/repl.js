// 1. Constants
var MAX_RESULTS = 10;
var FS = require('fs');
var READLINE = require('readline');

var navigateState = require('./lib/navigate-state');
var getIdeaDir = require('./lib/data-path').getIdeaDir;
var getDataDir = require('./lib/data-path').getDataDir;
var treeUtils = require('./content/tree-utils');
var fuzzySearch = require('./lib/fuzzy-search');

var commands = {
  'new': require('./management/new'),
  'remove': require('./management/remove'),
  'unlink': require('./linking/unlink'),
  'potential': require('./management/potential'),
  'content': require('./content/content'),
  'compile': require('./content/compile')
};

// 2. Variable initialization — none

// 3. Main workflow function

function run(args) {
  process.env.IDEA_REPL_MODE = 'true';

  var rl = READLINE.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'idea> '
  });

  console.log('ideaManager REPL');
  console.log('Commands: new, remove, unlink, navigate, potential, content, compile, help');
  console.log('Type exit or quit to leave');
  console.log('');

  rl.prompt();

  // Expose readline for interactive commands (new, etc.) to pause/resume
  global.__ideaReplRl = rl;

  var lineHandler = function(line) {
    handleLine(line, rl);
  };

  global.__ideaReplHandler = lineHandler;
  rl.on('line', lineHandler);

  rl.on('close', function() {
    setImmediate(function() {
      process.exit(0);
    });
  });

  return { success: true };
}

// 4. Subworkflow functions

// Process a complete line from readline
function handleLine(line, rl) {
  line = line.trim();

  if (line === 'exit' || line === 'quit') {
    rl.close();
    return;
  }

  if (line.length === 0) {
    rl.prompt();
    return;
  }

  var parts = splitLine(line);
  var cmd = parts[0];
  var cmdArgs = parts.slice(1);

  // Handle navigate: show top 10 results, navigate only on exact match
  if (cmd === 'navigate') {
    handleNavigate(cmdArgs);
    if (!global.__ideaReplPaused) {
      rl.prompt();
    }
    return;
  }

  // Handle help: show available commands with descriptions
  if (cmd === 'help') {
    showHelp();
    rl.prompt();
    return;
  }

  var commandModule = commands[cmd];

  if (!commandModule) {
    console.log('Unknown command: ' + cmd);
    rl.prompt();
    return;
  }

  var result = commandModule.run(cmdArgs);

  if (!result.success && result.error) {
    console.log(result.error);
  }

  if (!global.__ideaReplPaused) {
    rl.prompt();
  }
}

// Handle the navigate command in the REPL
// No args: show current node
// With query: show top 10 results, navigate only on exact match
function handleNavigate(args) {
  if (args.length === 0) {
    var current = navigateState.getCurrentNode();

    if (current) {
      console.log('Current node: ' + current);
    } else {
      console.log('No node selected. Usage: navigate <query>');
    }

    return;
  }

  var query = args.join(' ');
  navigateToTopResult(query);
}

// Always show top 10 results, then navigate only on exact match
function navigateToTopResult(query) {
  var queryLower = query.toLowerCase();

  // Always show top 10 results first
  printTopResults(query);
  console.log('');

  // Handle root special case (navigate regardless of data dir)
  if (queryLower === 'root') {
    navigateState.setCurrentNode('root');
    ensureRootDirExists();
    showChildrenAndParents('root');
    return;
  }

  // Navigate only on exact match to an existing idea
  var dataDir = getDataDir();

  if (FS.existsSync(dataDir)) {
    var entries = FS.readdirSync(dataDir);

    for (var i = 0; i < entries.length; i++) {
      if (entries[i].toLowerCase() === queryLower) {
        navigateState.setCurrentNode(entries[i]);
        showChildrenAndParents(entries[i]);
        return;
      }
    }
  }
}

// Print top MAX_RESULTS matching ideas sorted by relevance
function printTopResults(query) {
  var results = fuzzySearch.computeTopResults(query, MAX_RESULTS);

  if (results.length === 0) {
    console.log('');
    console.log('(no matches for "' + query + '")');
    return;
  }

  for (var i = 0; i < results.length; i++) {
    var number = i + 1;
    console.log(number + '. ' + results[i].name);
  }
}

// Create the root idea directory if it doesn't exist
function ensureRootDirExists() {
  var rootDir = getIdeaDir('root');

  if (!FS.existsSync(rootDir)) {
    FS.mkdirSync(rootDir, { recursive: true });
    console.log('Root idea directory created');
  }
}

// Show the navigated-to node with its children and parents
function showChildrenAndParents(name) {
  console.log('Navigated to: ' + name);

  var children = treeUtils.listChildren(name);

  if (children.length > 0) {
    console.log('Children:');

    for (var i = 0; i < children.length; i++) {
      console.log('  ' + children[i]);
    }
  }

  var parents = treeUtils.findAllParents(name);

  if (parents.length > 0) {
    console.log('Parents:');

    for (var j = 0; j < parents.length; j++) {
      console.log('  ' + parents[j]);
    }
  }
}

// Print help listing with descriptions for all REPL commands
function showHelp() {
  console.log('');
  console.log('Available commands:');
  console.log('  new <name>       Create a new idea under current node');
  console.log('  remove <name>    Delete an idea and its content');
  console.log('  unlink <child>   Remove a child link from current node');
  console.log('  navigate <query> Navigate to an idea. Shows top 10 results,');
  console.log('                   navigates only on exact match.');
  console.log('  potential <cmd>  Manage potential ideas (list, remove)');
  console.log('  content          Edit content entries for current node');
  console.log('  compile          Compile full text output from current node');
  console.log('  help             Show this help message');
  console.log('  exit / quit      Leave the REPL');
}

// Split a line into command parts by whitespace
function splitLine(line) {
  var parts = [];
  var current = '';

  for (var i = 0; i < line.length; i++) {
    var ch = line[i];

    if (ch === ' ') {
      if (current.length > 0) {
        parts.push(current);
        current = '';
      }
    } else {
      current = current + ch;
    }
  }

  if (current.length > 0) {
    parts.push(current);
  }

  return parts;
}

module.exports = { run: run };
