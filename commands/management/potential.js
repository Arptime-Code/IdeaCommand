// 1. Constants
var PATH = require('path');
var FS = require('fs');

var PROJECT_ROOT = PATH.resolve(__dirname, '..', '..');

// 2. Variable initialization — none

// 3. Main workflow functions

// Get path to potential ideas JSON file
function getPotentialFilePath() {
  var stateDir = process.env.IDEA_STATE_DIR || PROJECT_ROOT;
  return PATH.join(stateDir, 'potential-ideas.json');
}

// Read potential ideas from JSON file, return empty array if missing
function getPotentialIdeas() {
  var filePath = getPotentialFilePath();

  try {
    var content = FS.readFileSync(filePath, 'utf8');
    var data = JSON.parse(content);
    return data.ideas || [];
  } catch (err) {
    return [];
  }
}

// 4. Subworkflow functions

// Overwrite the potential ideas list in the JSON file
function savePotentialIdeas(ideas) {
  var filePath = getPotentialFilePath();
  var content = JSON.stringify({ ideas: ideas }, null, 2);
  FS.writeFileSync(filePath, content, 'utf8');
}

// Add a name to the potential ideas list, skip if duplicate
function addPotentialIdea(name) {
  var ideas = getPotentialIdeas();

  for (var i = 0; i < ideas.length; i++) {
    if (ideas[i] === name) {
      return;
    }
  }

  ideas.push(name);
  savePotentialIdeas(ideas);
}

// Remove a name from the potential ideas list
function removePotentialIdea(name) {
  var ideas = getPotentialIdeas();
  var found = false;

  for (var i = 0; i < ideas.length; i++) {
    if (ideas[i] === name) {
      ideas.splice(i, 1);
      found = true;
      break;
    }
  }

  if (!found) {
    return { success: false, error: 'Potential idea not found: ' + name };
  }

  savePotentialIdeas(ideas);
  return { success: true };
}

// CLI entry point — dispatches to list or remove subcommand
function run(args) {
  if (args.length === 0) {
    return {
      success: false,
      error: 'Usage: ideaManager potential <list|remove> [name]'
    };
  }

  var subcommand = args[0];

  if (subcommand === 'list') {
    var ideas = getPotentialIdeas();

    if (ideas.length === 0) {
      console.log('No potential ideas.');
    } else {
      console.log('Potential ideas:');
      for (var i = 0; i < ideas.length; i++) {
        console.log('  ' + (i + 1) + '. ' + ideas[i]);
      }
    }

    return { success: true };
  }

  if (subcommand === 'remove') {
    if (args.length < 2) {
      return {
        success: false,
        error: 'Usage: ideaManager potential remove <name>'
      };
    }

    var name = args[1];
    return removePotentialIdea(name);
  }

  return {
    success: false,
    error: 'Unknown subcommand: ' + subcommand + '. Use list or remove.'
  };
}

module.exports = {
  run: run,
  addPotentialIdea: addPotentialIdea,
  getPotentialIdeas: getPotentialIdeas
};
