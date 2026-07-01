// 1. Constants
var READLINE = require('readline');
var entriesEditor = require('./entries');

// 2. Variable initialization — none

// 3. Main workflow function

// Start the content editing REPL for the currently navigated node.
// Opens the editor directly for the node (no child-selection prompt).
// If rl is provided (e.g. from the main REPL), uses that instead of creating a new one.
// onExit is called when the editor exits (only in shared-readline mode).
function startContentRepl(ideaName, rl, onExit) {
  var ownRl = false;

  if (!rl) {
    rl = READLINE.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    ownRl = true;
  }

  console.log('');
  console.log('--- Content Editor ---');
  console.log('Editing node: ' + ideaName);

  showMenu(rl, ideaName, ideaName, ownRl, onExit);
}

// 4. Subworkflow functions

// Show the main menu and prompt for a choice
// parentName and childName are both the node name (self-referential content)
function showMenu(rl, nodeName, childName, ownRl, onExit) {
  var count = require('../content-store').getEntryCount(nodeName, childName);

  console.log('');
  console.log('Entries for "' + nodeName + '": ' + count + ' total');
  console.log('1. Add text entry');
  console.log('2. Add value-from-node entry');
  console.log('3. Edit existing entries');
  console.log('4. Exit');

  rl.question('Choice (1-4): ', function(choice) {
    choice = choice.trim();

    if (choice === '1') {
      entriesEditor.promptTextEntry(rl, nodeName, childName, ownRl, onExit);
    } else if (choice === '2') {
      entriesEditor.promptValueFromNode(rl, nodeName, childName, ownRl, onExit);
    } else if (choice === '3') {
      entriesEditor.showEditList(rl, nodeName, childName, ownRl, onExit);
    } else if (choice === '4') {
      console.log('Exiting content editor.');

      if (ownRl) {
        rl.close();
      }
      if (onExit) {
        onExit();
      }
    } else {
      console.log('Invalid choice. Please enter 1-4.');
      showMenu(rl, nodeName, childName, ownRl, onExit);
    }
  });
}

module.exports = {
  startContentRepl: startContentRepl,
  showMenu: showMenu
};
