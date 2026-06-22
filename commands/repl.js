// REPL mode flag — tells command modules to skip interactive prompts
process.env.IDEA_REPL_MODE = 'true';

var commands = {
  'new': require('./management/new'),
  'remove': require('./management/remove'),
  'link': require('./linking/link'),
  'unlink': require('./linking/unlink'),
  'list': require('./browsing/list'),
  'find': require('./browsing/find'),
  'navigate': require('./navigation/navigate'),
  'potential': require('./management/potential'),
  'content': require('./content/content'),
  'compile': require('./content/compile')
};

function run(args) {
  var READLINE = require('readline');

  var rl = READLINE.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'idea> '
  });

  console.log('ideaManager REPL');
  console.log('Commands: new, remove, link, unlink, list, find, navigate, potential, content, compile');
  console.log('Type exit or quit to leave');
  console.log('');

  rl.prompt();

  // Expose readline and handler globally so interactive commands can use them
  global.__ideaReplRl = rl;

  var lineHandler = function(line) {
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

    // Skip prompt if an interactive command (e.g. 'new') paused the REPL
    // The command will call resumeRepl() which prompts when ready
    if (!global.__ideaReplPaused) {
      rl.prompt();
    }
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
