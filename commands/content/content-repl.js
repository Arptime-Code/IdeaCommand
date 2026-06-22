// 1. Constants
var FS = require('fs');
var READLINE = require('readline');
var store = require('./content-store');
var treeUtils = require('./tree-utils');
var getIdeaDir = require('../lib/data-path').getIdeaDir;

var TEXT_DELIMITER = '---';

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
  var count = store.getEntryCount(parentName, childName);

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
      promptTextEntry(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '2') {
      promptValueFromNode(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '3') {
      showEditList(rl, parentName, childName, ownRl, onExit);
    } else if (choice === '4') {
      // Back to child selection
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

// Collect multi-line text input until delimiter is entered on its own line
function promptTextEntry(rl, parentName, childName, ownRl, onExit) {
  var lines = [];

  console.log('');
  console.log('Enter text (type "' + TEXT_DELIMITER + '" on a new line to finish):');

  // Switch to line-by-line collection mode
  rl.question('> ', function onLine(line) {
    if (line.trim() === TEXT_DELIMITER) {
      var content = lines.join('\n');

      if (content.length === 0) {
        console.log('No text entered. Entry cancelled.');
        showMenu(rl, parentName, childName, ownRl, onExit);
        return;
      }

      var entry = {
        type: 'text',
        content: content
      };

      var result = store.addEntry(parentName, childName, entry);

      if (result.success) {
        console.log('Text entry added (' + countLines(content) + ' lines).');
      } else {
        console.log('Error: ' + result.error);
      }

      showMenu(rl, parentName, childName, ownRl, onExit);
      return;
    }

    lines.push(line);
    rl.question('> ', onLine);
  });
}

// Prompt for parent and child name to create a value-from-node entry
function promptValueFromNode(rl, parentName, childName, ownRl, onExit) {
  console.log('');

  rl.question('Enter parent idea name: ', function(refParentName) {
    refParentName = refParentName.trim();

    if (refParentName.length === 0) {
      console.log('Parent name required. Entry cancelled.');
      showMenu(rl, parentName, childName, ownRl, onExit);
      return;
    }

    rl.question('Enter child idea name: ', function(refChildName) {
      refChildName = refChildName.trim();

      if (refChildName.length === 0) {
        console.log('Child name required. Entry cancelled.');
        showMenu(rl, parentName, childName, ownRl, onExit);
        return;
      }

      // Check if child idea exists at all
      var refChildDir = getIdeaDir(refChildName);
      if (!FS.existsSync(refChildDir)) {
        console.log('Error: Idea "' + refChildName + '" does not exist.');
        showMenu(rl, parentName, childName, ownRl, onExit);
        return;
      }

      // Validate the parent-child link exists
      if (!treeUtils.childExists(refParentName, refChildName)) {
        console.log('Error: "' + refChildName + '" is not a child of "' + refParentName + '".');
        console.log('Use "ideaManager link ' + refParentName + ' ' + refChildName + '" to create the link first.');
        showMenu(rl, parentName, childName, ownRl, onExit);
        return;
      }

      var entry = {
        type: 'value-from-node',
        parentName: refParentName,
        childName: refChildName
      };

      var result = store.addEntry(parentName, childName, entry);

      if (result.success) {
        console.log('Value reference added: ' + refParentName + ' -> ' + refChildName);
      } else {
        console.log('Error: ' + result.error);
      }

      showMenu(rl, parentName, childName, ownRl, onExit);
    });
  });
}

// List entries and let user pick one to edit or delete
function showEditList(rl, parentName, childName, ownRl, onExit) {
  var data = store.loadContent(parentName, childName);

  if (data.entries.length === 0) {
    console.log('No entries to edit.');
    showMenu(rl, parentName, childName, ownRl, onExit);
    return;
  }

  console.log('');
  console.log('--- Entries ---');

  for (var i = 0; i < data.entries.length; i++) {
    var entry = data.entries[i];
    var label = '[' + i + '] ';

    if (entry.type === 'text') {
      var preview = entry.content.slice(0, 60);
      if (entry.content.length > 60) {
        preview = preview + '...';
      }
      console.log(label + 'TEXT: ' + preview);
    } else if (entry.type === 'value-from-node') {
      console.log(label + 'VALUE: ' + entry.parentName + ' -> ' + entry.childName);
    }
  }

  console.log('');
  console.log('Enter index to edit, d<index> to delete, or empty to go back:');

  rl.question('> ', function(input) {
    input = input.trim();

    if (input.length === 0) {
      showMenu(rl, parentName, childName, ownRl, onExit);
      return;
    }

    // Check for delete command
    if (input.length > 1 && input[0] === 'd') {
      var delIndex = parseInt(input.slice(1), 10);

      if (isNaN(delIndex) || delIndex < 0 || delIndex >= data.entries.length) {
        console.log('Invalid index: ' + input.slice(1));
        showEditList(rl, parentName, childName, ownRl, onExit);
        return;
      }

      var removed = data.entries[delIndex];
      var result = store.removeEntry(parentName, childName, delIndex);

      if (result.success) {
        console.log('Deleted entry ' + delIndex + ' (' + removed.type + ').');
      } else {
        console.log('Error: ' + result.error);
      }

      showEditList(rl, parentName, childName, ownRl, onExit);
      return;
    }

    // Otherwise try to edit by index
    var editIndex = parseInt(input, 10);

    if (isNaN(editIndex) || editIndex < 0 || editIndex >= data.entries.length) {
      console.log('Invalid index: ' + input);
      showEditList(rl, parentName, childName, ownRl, onExit);
      return;
    }

    editEntryAt(rl, parentName, childName, editIndex, data.entries[editIndex], ownRl, onExit);
  });
}

// Show details of an entry and prompt for new value
function editEntryAt(rl, parentName, childName, index, entry, ownRl, onExit) {
  console.log('');
  console.log('--- Editing Entry ' + index + ' ---');

  if (entry.type === 'text') {
    console.log('Type: text');
    console.log('Content:');
    console.log(entry.content);
    console.log('');
    console.log('Enter new text (or empty to keep current):');

    rl.question('> ', function(newContent) {
      if (newContent.length > 0) {
        entry.content = newContent;
        var result = store.updateEntry(parentName, childName, index, entry);

        if (result.success) {
          console.log('Entry updated.');
        } else {
          console.log('Error: ' + result.error);
        }
      } else {
        console.log('Entry unchanged.');
      }

      showEditList(rl, parentName, childName, ownRl, onExit);
    });
  } else if (entry.type === 'value-from-node') {
    console.log('Type: value reference');
    console.log('Parent: ' + entry.parentName);
    console.log('Child: ' + entry.childName);
    console.log('');
    console.log('Edit not supported for value references. Delete and re-add.');
    showEditList(rl, parentName, childName, ownRl, onExit);
  }
}

// Count lines in a string
function countLines(str) {
  if (str.length === 0) {
    return 0;
  }
  var count = 1;
  for (var i = 0; i < str.length; i++) {
    if (str[i] === '\n') {
      count++;
    }
  }
  return count;
}

module.exports = {
  startContentRepl: startContentRepl
};
