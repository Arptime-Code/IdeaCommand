var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
var indexJs = process.env.IDEA_INDEX_PATH;
var dataDir = PATH.join(testRoot, 'data');
var stateDir = PATH.join(testRoot, 'state');

function cliWithParent(args, answers) {
  var env = Object.assign({}, process.env, {
    IDEA_DATA_DIR: dataDir,
    IDEA_STATE_DIR: stateDir
  });
  var options = {
    env: env
  };
  if (answers) {
    options.input = answers;
  }
  var result = CHILD_PROCESS.spawnSync('node', [indexJs].concat(args), options);
  return {
    code: result.status,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString()
  };
}

function cli(args) {
  var env = Object.assign({}, process.env, {
    IDEA_DATA_DIR: dataDir
  });
  var result = CHILD_PROCESS.spawnSync('node', [indexJs].concat(args), { env: env });
  return {
    code: result.status,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString()
  };
}

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup: create a parent idea and navigate state
FS.mkdirSync(dataDir, { recursive: true });
FS.mkdirSync(stateDir, { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'root'), { recursive: true });
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'root' }));

// Test 1: Create a new idea under parent (3 y answers, no tag)
var result = cliWithParent(['new', 'cooking'], 'y\ny\ny\n');
assert(result.code === 0, 'new cooking should succeed');
assert(result.stdout.indexOf('Created idea: cooking under root') !== -1, 'should print created message');

var ideaDir = PATH.join(dataDir, 'cooking');
assert(FS.existsSync(ideaDir), 'cooking folder should exist');
assert(FS.statSync(ideaDir).isDirectory(), 'cooking should be a directory');

// Verify content file was created under parent
var contentPath = PATH.join(dataDir, 'root', 'cooking.json');
assert(FS.existsSync(contentPath), 'content file root/cooking.json should exist');
var content = JSON.parse(FS.readFileSync(contentPath, 'utf8'));
assert(Array.isArray(content.entries), 'content file should have entries array');

// Test 2: Create another idea under parent
result = cliWithParent(['new', 'programming'], 'y\ny\ny\n');
assert(result.code === 0, 'new programming should succeed');

// Test 3: Create with empty name (fails at validation before navigate check)
result = cli(['new', '']);
assert(result.code !== 0, 'new with empty name should fail');

// Test 4: Create with name containing slash
result = cli(['new', 'a/b']);
assert(result.code !== 0, 'new with slash should fail');

// Test 5: Create duplicate
result = cliWithParent(['new', 'cooking'], 'y\ny\ny\n');
assert(result.code !== 0, 'new duplicate should fail');

// Test 6: Create with no name
result = cli(['new']);
assert(result.code !== 0, 'new with no args should fail');

// Test 7: Create with dot name
result = cli(['new', '.']);
assert(result.code !== 0, 'new with dot should fail');

// Test 8: Create with dot dot name
result = cli(['new', '..']);
assert(result.code !== 0, 'new with dot dot should fail');

// Test 9: New without navigate state should show error
// Use a clean state dir with no .current-node.json
var cleanStateDir = PATH.join(testRoot, 'clean-state');
FS.mkdirSync(cleanStateDir, { recursive: true });
result = CHILD_PROCESS.spawnSync('node', [indexJs, 'new', 'orphan'], {
  env: Object.assign({}, process.env, {
    IDEA_DATA_DIR: dataDir,
    IDEA_STATE_DIR: cleanStateDir
  })
});
assert(result.status !== 0, 'new without navigate should fail');
var output = result.stdout.toString() + result.stderr.toString();
assert(output.indexOf('No node selected') !== -1, 'should show navigate first error');

console.log('PASS: test-new');
process.exit(0);
