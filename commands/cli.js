#!/usr/bin/env node

// 1. Constants

var COMMANDS = {
  'new': './management/new',
  'remove': './management/remove',
  'unlink': './linking/unlink',
  'potential': './management/potential',
  'content': './content/content',
  'compile': './content/compile',
  'repl': './repl'
};

// 2. Variable initialization

var args = process.argv.slice(2);

// 3. Main workflow function

// No arguments — launch the REPL directly
if (args.length === 0) {
  var repl = require('./repl');
  repl.run([]);
  return;
}

// Has arguments — run as CLI commands (for scripting and tests)

var command = args[0];
var commandArgs = args.slice(1);

// Explicit repl command
if (command === 'repl') {
  require('./repl').run(commandArgs);
  return;
}

var modulePath = COMMANDS[command];

if (!modulePath) {
  console.log('Unknown command: ' + command);
  process.exit(1);
}

var commandModule = require(modulePath);
var result = commandModule.run(commandArgs);

if (!result.success) {
  if (result.error) {
    console.log(result.error);
  }
  process.exit(1);
}

// 4. Subworkflow functions — none (all logic is inline)
