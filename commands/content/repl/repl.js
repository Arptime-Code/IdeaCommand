// 1. Constants
var READLINE = require('readline');
var treeUtils = require('../tree-utils');
var entriesEditor = require('./entries');

// 2. Variable initialization — none

// 3. Main workflow function

// Start the content editing REPL.
// First asks which child to edit, then opens the entry editor for that child.
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
  console.log('Parent node: ' + ideaName);

  promptChildSelection(rl, ideaName, ownRl, onExit);
}

// 4. Subworkflow functions

// Ask which child to edit, then open the editor for that child
function promptChildSelection(rl, parentName, ownRl, onExit) {
  var children = treeUtils.listChildren(parentName);

  if (children.length === 0) {
    console.log('');
    console.log('No children found under "' + parentName + '".');
    console.log('Use "new <name>" to create ideas under this node first.');

    if (ownRl) {
      rl.close();
    }
    if (onExit) {
      onExit();
    }
    return;
  }

  console.log('');
  console.log('Children:');

  for (var i = 0; i < children.length; i++) {
    console.log((i + 1) + '. ' + children[i]);
  }

  console.log('');

  rl.question('Select child (1-' + children.length + '): ', function(choice) {
    choice = choice.trim();
    var index = parseInt(choice, 10) - 1;

    if (isNaN(index) || index < 0 || index >= children.length) {
      console.log('Invalid choice.');

      if (ownRl) {
        rl.close();
      }
      if (onExit) {
        onExit();
      }
      return;
    }

    var childName = children[index];
    console.log('');
    console.log('Editing: ' + parentName + ' -> ' + childName);
    showMenu(rl, parentName, childName, ownRl, onExit);
  });
}

// Show the main menu and prompt for a choice
function showMenu(rl, parentName, childName, ownRl, onExit) {
  var count = require('../content-store').getEntryCount(parentName, childName);

  console.log('');
  console.log('Current: ' + count + ' entries');
  console.log('1. Add text entry');
  console.log('2. Add value-from-node entry');
  console.log('3. Edit existing entries');
  console.log('4. Back to child selection');
  console.log('5. Exit');

  rl.question('Choice (1-5): ', function(choice) {
    choice = choice.trim();

    if (choice === '1') {
      entriesEditor.promptTextEntry(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '2') {
      entriesEditor.promptValueFromNode(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '3') {
      entriesEditor.showEditList(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '4') {
      // Back to child selection — call promptChildSelection directly
      promptChildSelection(rl, parentName, ownRl, onExit);
    } else if (choice === '5') {
      console.log('Exiting content editor.');

      if (ownRl) {
        rl.close();
      }
      if (onExit) {
        onExit();
      }
    } else {
      console.log('Invalid choice. Please enter 1-5.');
      showMenu(rl, parentName, childName, ownRl, onExit);
    }
  });
}

module.exports = {
  startContentRepl: startContentRepl,
  showMenu: showMenu
};
