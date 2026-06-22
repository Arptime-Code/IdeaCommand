var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
if (!testRoot) {
  console.log('FAIL: IDEA_TEST_ROOT not set');
  process.exit(1);
}

var dataDir = PATH.join(testRoot, 'compile-data');
var stateDir = PATH.join(testRoot, 'compile-state');
var indexJs = process.env.IDEA_INDEX_PATH;

FS.mkdirSync(dataDir, { recursive: true });
FS.mkdirSync(stateDir, { recursive: true });

function cli(args) {
  var env = Object.assign({}, process.env, {
    IDEA_DATA_DIR: dataDir,
    IDEA_STATE_DIR: stateDir
  });
  var result = CHILD_PROCESS.spawnSync('node', [indexJs].concat(args), { env: env });
  return {
    code: result.status,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString()
  };
}

function writeChildContent(parent, child, entries) {
  var parentDir = PATH.join(dataDir, parent);
  if (!FS.existsSync(parentDir)) {
    FS.mkdirSync(parentDir, { recursive: true });
  }
  var childDir = PATH.join(dataDir, child);
  if (!FS.existsSync(childDir)) {
    FS.mkdirSync(childDir, { recursive: true });
  }
  var contentPath = PATH.join(parentDir, child + '.json');
  FS.writeFileSync(contentPath, JSON.stringify({ entries: entries }, null, 2));
}

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup tree using .json files as content storage:
// root/
//   cooking.json  (has text "I like cooking")
//   programming.json (has text "I like programming")
// cooking/
//   pasta.json  (has text "Pasta is great")
//   pizza.json  (has text "Pizza is great")

writeChildContent('root', 'cooking', [
  { type: 'text', content: 'I like cooking' }
]);

writeChildContent('root', 'programming', [
  { type: 'text', content: 'I like programming' }
]);

writeChildContent('cooking', 'pasta', [
  { type: 'text', content: 'Pasta is great' }
]);

writeChildContent('cooking', 'pizza', [
  { type: 'text', content: 'Pizza is great' }
]);

// Set navigate state to root
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'root' }));

// Test 1: Compile from root — should output all text content together
var result = cli(['compile']);
assert(result.code === 0, 'compile from root should succeed');
var output = result.stdout;
assert(output.indexOf('I like cooking') !== -1, 'should output cooking text');
assert(output.indexOf('Pasta is great') !== -1, 'should output pasta text');
assert(output.indexOf('Pizza is great') !== -1, 'should output pizza text');
assert(output.indexOf('I like programming') !== -1, 'should output programming text');
assert(output.indexOf('ERROR') === -1, 'should have no errors');

// Test 2: Compile with no navigate state (clean state dir)
var cleanStateDir = PATH.join(testRoot, 'compile-clean-state');
FS.mkdirSync(cleanStateDir, { recursive: true });
var env = Object.assign({}, process.env, {
  IDEA_DATA_DIR: dataDir,
  IDEA_STATE_DIR: cleanStateDir
});
result = CHILD_PROCESS.spawnSync('node', [indexJs, 'compile'], { env: env });
assert(result.status !== 0, 'compile with no navigate state should fail');

// Test 3: Compile with value-from-node references (direct link exists)
writeChildContent('cooking', 'pasta', [
  { type: 'text', content: 'Pasta is great' }
]);
writeChildContent('cooking', 'couscous', [
  { type: 'text', content: 'I like cooking' },
  {
    type: 'value-from-node',
    parentName: 'cooking',
    childName: 'pasta'
  }
]);

// Navigate to cooking
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'cooking' }));

result = cli(['compile']);
assert(result.code === 0, 'compile with value reference should succeed');
var output = result.stdout;
assert(output.indexOf('Pasta is great') !== -1, 'should include referenced pasta content');
assert(output.indexOf('ERROR') === -1, 'should have no errors');

// Test 4: Compile with value reference where direct link is missing (child moved deeper)
// Move pasta from cooking to a new "cuisine" node under cooking
FS.mkdirSync(PATH.join(dataDir, 'cuisine'), { recursive: true });
FS.writeFileSync(PATH.join(dataDir, 'cooking', 'cuisine.json'), JSON.stringify({ entries: [] }));
FS.writeFileSync(PATH.join(dataDir, 'cuisine', 'pasta.json'), JSON.stringify({ entries: [{ type: 'text', content: 'Pasta is great' }] }));
// Remove the direct link cooking -> pasta
FS.unlinkSync(PATH.join(dataDir, 'cooking', 'pasta.json'));

// Navigate to cooking and compile
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'cooking' }));

result = cli(['compile']);
assert(result.code === 0, 'compile with moved child should succeed (auto-resolve)');
var output = result.stdout;
assert(output.indexOf('Pasta is great') !== -1, 'should still include pasta content');

// Test 5: Compile with reference to non-existent child idea
// Restore the original link and add bad reference
FS.writeFileSync(PATH.join(dataDir, 'cooking', 'pasta.json'), JSON.stringify({ entries: [{ type: 'text', content: 'Pasta is great' }] }));
writeChildContent('root', 'cooking', [
  { type: 'text', content: 'Welcome' },
  {
    type: 'value-from-node',
    parentName: 'cooking',
    childName: 'nonexistent'
  }
]);

FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'root' }));

result = cli(['compile']);
assert(result.code !== 0, 'compile with bad reference should fail');
var output = result.stdout;
assert(output.indexOf('Compilation errors') !== -1, 'should report compilation errors');
assert(output.indexOf('not found') !== -1, 'should indicate child not found');

// Test 6: Compile with an empty child node
// Reset root/cooking.json from the bad reference in Test 5 first
writeChildContent('root', 'cooking', [{ type: 'text', content: 'I like cooking' }]);
writeChildContent('root', 'empty-node', []);
result = cli(['compile']);
assert(result.code === 0, 'compile with empty node should succeed');

// Test 7: Circular reference detection — should just skip and not crash
writeChildContent('cooking', 'couscous', [
  { type: 'text', content: 'I like cooking' },
  {
    type: 'value-from-node',
    parentName: 'cooking',
    childName: 'cooking'
  }
]);
// Link cooking as a child of itself (circular)
FS.writeFileSync(PATH.join(dataDir, 'cooking', 'cooking.json'), JSON.stringify({ entries: [] }));

FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'cooking' }));

result = cli(['compile']);
assert(result.code === 0, 'compile with circular reference should not crash');

console.log('PASS: test-compile');
process.exit(0);
