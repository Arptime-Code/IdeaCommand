// 1. Constants
var store = require('../content-store');
var valueNav = require('../nav/start');

var TEXT_DELIMITER = '---';

// 2. Variable initialization — none

// 3. Main workflow function — promptTextEntry

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
        var repl = require('./repl');
        repl.showMenu(rl, parentName, childName, ownRl, onExit);
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

      var repl = require('./repl');
      repl.showMenu(rl, parentName, childName, ownRl, onExit);
      return;
    }

    lines.push(line);
    rl.question('> ', onLine);
  });
}

// Start interactive tag-based navigation to build a value-from-node entry
function promptValueFromNode(rl, parentName, childName, ownRl, onExit) {
  console.log('');
  console.log('Navigate to the idea whose value you want to reference.');
  console.log('Starting from: ' + childName + ' (under ' + parentName + ')');
  console.log('');

  valueNav.startValueNavigation(rl, childName, function(path) {
    if (path.length === 0) {
      console.log('No path defined. Entry cancelled.');
      var repl = require('./repl');
      repl.showMenu(rl, parentName, childName, ownRl, onExit);
      return;
    }

    var entry = {
      type: 'value-from-node',
      path: path
    };

    var result = store.addEntry(parentName, childName, entry);

    if (result.success) {
      console.log('Value reference added with path (' + path.length + ' steps).');
    } else {
      console.log('Error: ' + result.error);
    }

    var repl = require('./repl');
    repl.showMenu(rl, parentName, childName, ownRl, onExit);
  });
}

// 4. Subworkflow functions

// List entries and let user pick one to edit or delete
function showEditList(rl, parentName, childName, ownRl, onExit) {
  var data = store.loadContent(parentName, childName);

  if (data.entries.length === 0) {
    console.log('No entries to edit.');
    var repl = require('./repl');
    repl.showMenu(rl, parentName, childName, ownRl, onExit);
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
      if (entry.path) {
        var pathStr = '';
        for (var p = 0; p < entry.path.length; p++) {
          if (p > 0) { pathStr = pathStr + ' -> '; }
          pathStr = pathStr + entry.path[p].direction + ':' + entry.path[p].tag;
        }
        console.log(label + 'VALUE PATH: ' + pathStr);
      } else if (entry.parentName) {
        console.log(label + 'VALUE: ' + entry.parentName + ' -> ' + entry.childName);
      }
    }
  }

  console.log('');
  console.log('Enter index to edit, d<index> to delete, or empty to go back:');

  rl.question('> ', function(input) {
    input = input.trim();

    if (input.length === 0) {
      var repl = require('./repl');
      repl.showMenu(rl, parentName, childName, ownRl, onExit);
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
    if (entry.path) {
      var pathStr = '';
      for (var p = 0; p < entry.path.length; p++) {
        if (p > 0) { pathStr = pathStr + ' -> '; }
        pathStr = pathStr + entry.path[p].direction + ':' + entry.path[p].tag;
      }
      console.log('Path: ' + pathStr);
    } else {
      console.log('Parent: ' + entry.parentName);
      console.log('Child: ' + entry.childName);
    }
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
  promptTextEntry: promptTextEntry,
  promptValueFromNode: promptValueFromNode,
  showEditList: showEditList,
  editEntryAt: editEntryAt
};
