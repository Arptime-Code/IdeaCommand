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

  // Recursive helper that asks the next question in the filtered list
  function askNext() {
    if (currentIndex >= filtered.length) {
      if (ownRl) {
        rl.close();
      }
      callbacks.onAllYes();
      return;
    }

    var question = filtered[currentIndex];
    var questionType = question.type || 'yesno';

    // Print context info before the question
    if (question.contextType === 'name-only') {
      console.log('Name: ' + name);
      console.log('');
    } else if (question.contextType === 'name-and-parent') {
      console.log('Name: ' + name);
      console.log('Parent: ' + parent);
      console.log('');
    }

    // advanceToNext increments currentIndex then calls askNext for the NEXT question
    function advanceToNext() {
      currentIndex++;
      askNext();
    }

    if (questionType === 'yesno' || questionType === undefined) {
      askYesNoQuestion(rl, question, name, parent, ownRl, callbacks, advanceToNext);
    }
  }

  askNext();
}

// 4. Subworkflow functions

// Handle a yes/no type question — uses onNext to proceed after answering
function askYesNoQuestion(rl, question, name, parent, ownRl, callbacks, onNext) {
  var displayText = formatText(question.text, name, parent || '');

  rl.question(displayText + ' (y/n): ', function(answer) {
    var trimmed = answer.trim().toLowerCase();

    if (trimmed === 'y') {
      onNext();
    } else if (trimmed === 'n') {
      if (ownRl) {
        rl.close();
      }

      if (question.negativeBehavior === 'save-potential') {
        callbacks.onSavePotential(name);
      } else {
        callbacks.onStop();
      }
    } else {
      console.log('Please answer y or n.');
      askYesNoQuestion(rl, question, name, parent, ownRl, callbacks, onNext);
    }
  });
}

module.exports = {
  askQuestions: askQuestions,
  loadQuestions: loadQuestions
};
