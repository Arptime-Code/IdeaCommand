// 1. Constants
var PATH = require('path');
var FS = require('fs');
var READLINE = require('readline');

var QUESTIONS_PATH = PATH.resolve(__dirname, '..', '..', 'config', 'questions.json');

// 2. Variable initialization — none

// 3. Main workflow functions

// Load question definitions from config/questions.json
function loadQuestions() {
  try {
    var content = FS.readFileSync(QUESTIONS_PATH, 'utf8');
    var data = JSON.parse(content);
    return data.questions || [];
  } catch (err) {
    return [];
  }
}

// Replace %name% and %parent% placeholders with actual values
function formatText(template, name, parent) {
  var result = template;

  for (var i = 0; i < result.length; i++) {
    // Find each %...% placeholder and replace it
    if (result[i] === '%') {
      var endIndex = i + 1;
      while (endIndex < result.length && result[endIndex] !== '%') {
        endIndex++;
      }
      if (endIndex < result.length) {
        var placeholder = result.slice(i, endIndex + 1);
        if (placeholder === '%name%') {
          result = result.slice(0, i) + name + result.slice(endIndex + 1);
        } else if (placeholder === '%parent%') {
          result = result.slice(0, i) + parent + result.slice(endIndex + 1);
        }
      }
    }
  }

  return result;
}

// Ask each question in order via readline
// Calls onAllYes if all answered y, onStop or onSavePotential on first n
// If rl is provided (existing readline), uses it instead of creating a new one
function askQuestions(name, parent, callbacks, rl) {
  var questions = loadQuestions();

  if (questions.length === 0) {
    callbacks.onAllYes();
    return;
  }

  // Filter out parent-dependent questions if no parent given
  var filtered = [];

  for (var i = 0; i < questions.length; i++) {
    var q = questions[i];

    if (q.contextType === 'name-and-parent' && !parent) {
      continue;
    }

    filtered.push(q);
  }

  if (filtered.length === 0) {
    callbacks.onAllYes();
    return;
  }

  var currentIndex = 0;
  var ownRl = false;

  if (!rl) {
    rl = READLINE.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    ownRl = true;
  }

  function askNext() {
    if (currentIndex >= filtered.length) {
      if (ownRl) {
        rl.close();
      }
      callbacks.onAllYes();
      return;
    }

    var question = filtered[currentIndex];

    // Print context info before the question
    if (question.contextType === 'name-only') {
      console.log('Name: ' + name);
      console.log('');
    } else if (question.contextType === 'name-and-parent') {
      console.log('Name: ' + name);
      console.log('Parent: ' + parent);
      console.log('');
    }

    var displayText = formatText(question.text, name, parent || '');

    rl.question(displayText + ' (y/n): ', function(answer) {
      var trimmed = answer.trim().toLowerCase();

      if (trimmed === 'y') {
        currentIndex++;
        askNext();
      } else if (trimmed === 'n') {
        if (ownRl) {
          rl.close();
        }

        if (question.negativeBehavior === 'save-potential') {
          callbacks.onSavePotential(name);
        } else {
          // 'stop' behavior — silently cancel
          callbacks.onStop();
        }
      } else {
        console.log('Please answer y or n.');
        askNext();
      }
    });
  }

  askNext();
}

module.exports = {
  askQuestions: askQuestions,
  loadQuestions: loadQuestions
};
