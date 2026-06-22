var PATH = require('path');
var FS = require('fs');
var CHILD_PROCESS = require('child_process');

var configPath = PATH.join(__dirname, '..', '..', 'config', 'questions.json');

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Test 1: Config file exists and is valid JSON
assert(FS.existsSync(configPath), 'questions.json should exist');

var content = FS.readFileSync(configPath, 'utf8');
var config = JSON.parse(content);

// Test 2: Config has questions array
assert(config.questions, 'config should have questions array');
assert(config.questions.length === 3, 'should have exactly 3 questions');

// Test 3: Each question has required fields
for (var i = 0; i < config.questions.length; i++) {
  var q = config.questions[i];

  assert(q.id, 'question ' + i + ' should have an id');
  assert(q.text, 'question ' + i + ' should have text');
  assert(q.contextType, 'question ' + i + ' should have contextType');
  assert(q.negativeBehavior, 'question ' + i + ' should have negativeBehavior');

  var validContext = q.contextType === 'name-only' || q.contextType === 'name-and-parent';
  assert(validContext, 'question ' + i + ' contextType should be valid');

  var validBehavior = q.negativeBehavior === 'stop' || q.negativeBehavior === 'save-potential';
  assert(validBehavior, 'question ' + i + ' negativeBehavior should be valid');
}

// Test 4: Load questions via module
var questionsModule = require('../../commands/management/questions');
var loaded = questionsModule.loadQuestions();
assert(loaded.length === 3, 'loadQuestions should return 3 questions');

// Test 5: First question should be concept-or-value with stop behavior
assert(loaded[0].id === 'concept-or-value', 'first question should be concept-or-value');
assert(loaded[0].negativeBehavior === 'stop', 'first question should have stop behavior');

// Test 6: Other two questions should have save-potential behavior
assert(loaded[1].negativeBehavior === 'save-potential', 'second question should have save-potential behavior');
assert(loaded[2].negativeBehavior === 'save-potential', 'third question should have save-potential behavior');

// Test 7: Question text contains placeholders
assert(loaded[0].text.indexOf('%name%') !== -1, 'concept question should have %name% placeholder');
assert(loaded[1].text.indexOf('%name%') !== -1, 'direct-child question should have %name% placeholder');
assert(loaded[1].text.indexOf('%parent%') !== -1, 'direct-child question should have %parent% placeholder');

console.log('PASS: test-questions');
process.exit(0);
