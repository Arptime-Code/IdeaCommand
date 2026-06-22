#!/usr/bin/env node

var COMMANDS = {
  'new': './management/new',
  'remove': './management/remove',
  'link': './linking/link',
  'unlink': './linking/unlink',
  'list': './browsing/list',
  'find': './browsing/find',
  'navigate': './navigation/navigate',
  'potential': './management/potential',
  'content': './content/content',
  'compile': './content/compile',
  'repl': './repl'
};

var args = process.argv.slice(2);
var command = args[0];
var commandArgs = args.slice(1);

function main() {
  if (!command) {
    printUsage();
    process.exit(1);
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
}

function printUsage() {
  console.log('Usage: ideaManager <command> [args]');
  console.log('');
  console.log('Commands:');
  console.log('  new <name>       Create a new idea');
  console.log('  remove <name>    Delete an idea');
  console.log('  link <p> <c>     Link child idea under parent');
  console.log('  unlink <p> <c>   Remove a link');
  console.log('  list <name>      List sub-ideas under an idea');
  console.log('  find <query>     Search ideas by name');
  console.log('  navigate <name>  Navigate to an idea (sets it as current node)');
  console.log('  potential <cmd>  Manage potential ideas (list, remove)');
  console.log('  content          Enter interactive content editor for current node');
  console.log('  compile          Compile full text output from current node');
  console.log('  repl             Interactive REPL session');
}

main();
