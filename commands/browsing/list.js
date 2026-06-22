var FS = require('fs');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var validateName = require('../lib/validate-name');

function run(args) {
  if (args.length === 0) {
    return { success: false, error: 'Usage: ideaManager list <name>' };
  }

  var name = args[0];
  var validationError = validateName(name);
  if (validationError) {
    return { success: false, error: validationError };
  }

  var ideaDir = getIdeaDir(name);

  if (!FS.existsSync(ideaDir)) {
    return { success: false, error: 'Idea not found: ' + name };
  }

  var entries = FS.readdirSync(ideaDir);
  var childNames = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.length > 5 && entry.slice(-5) === '.json') {
      childNames.push(entry.slice(0, -5));
    }
  }

  childNames.sort();

  for (var j = 0; j < childNames.length; j++) {
    console.log(childNames[j]);
  }

  return { success: true };
}

module.exports = { run: run };
