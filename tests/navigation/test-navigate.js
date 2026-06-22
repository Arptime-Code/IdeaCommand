var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
var indexJs = process.env.IDEA_INDEX_PATH;
var stateDir = PATH.join(testRoot, 'navigate-state');
var dataDir = PATH.join(testRoot, 'navigate-data');

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

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup state directory and data directory
FS.mkdirSync(stateDir, { recursive: true });
FS.mkdirSync(PATH.join(dataDir), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'cooking'), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'programming'), { recursive: true });
process.env.IDEA_STATE_DIR = stateDir;

// Test 1: Navigate with no args and no state set
var result = cli(['navigate']);
assert(result.code === 0, 'navigate with no args should succeed');
assert(result.stdout.indexOf('No node selected') !== -1, 'should show no node message');

// Test 2: Navigate to a valid name
result = cli(['navigate', 'cooking']);
assert(result.code === 0, 'navigate cooking should succeed');
assert(result.stdout.indexOf('Navigated to: cooking') !== -1, 'should show navigated message');

// Verify state file was written
var stateContent = JSON.parse(FS.readFileSync(PATH.join(stateDir, '.current-node.json'), 'utf8'));
assert(stateContent.currentNode === 'cooking', 'state file should contain cooking');

// Test 3: Navigate with no args to show current node
result = cli(['navigate']);
assert(result.code === 0, 'navigate with no args should show current');
assert(result.stdout.indexOf('Current node: cooking') !== -1, 'should show current node');

// Test 4: Navigate to a different node
result = cli(['navigate', 'programming']);
assert(result.code === 0, 'navigate programming should succeed');
assert(result.stdout.indexOf('Navigated to: programming') !== -1, 'should show navigated message');

stateContent = JSON.parse(FS.readFileSync(PATH.join(stateDir, '.current-node.json'), 'utf8'));
assert(stateContent.currentNode === 'programming', 'state file should now contain programming');

// Test 5: Navigate with invalid name (empty)
result = cli(['navigate', '']);
assert(result.code !== 0, 'navigate with empty name should fail');

// Test 6: Navigate with slash in name
result = cli(['navigate', 'a/b']);
assert(result.code !== 0, 'navigate with slash should fail');

// Test 7: Navigate to dot
result = cli(['navigate', '.']);
assert(result.code !== 0, 'navigate with dot should fail');

// Test 8: Navigate to root auto-creates the root directory
FS.rmSync(dataDir, { recursive: true, force: true });
result = cli(['navigate', 'root']);
assert(result.code === 0, 'navigate root should succeed');
assert(result.stdout.indexOf('Root idea directory created') !== -1, 'should print root directory created message');
var rootDir = PATH.join(dataDir, 'root');
assert(FS.existsSync(rootDir), 'root directory should be created');
assert(FS.statSync(rootDir).isDirectory(), 'root should be a directory');

// Verify state was set correctly
stateContent = JSON.parse(FS.readFileSync(PATH.join(stateDir, '.current-node.json'), 'utf8'));
assert(stateContent.currentNode === 'root', 'state file should contain root');

// Test 9: Navigate to root again (already exists, no creation message)
result = cli(['navigate', 'root']);
assert(result.code === 0, 'navigate root again should succeed');
assert(result.stdout.indexOf('Root idea directory created') === -1, 'should not print creation message again');

console.log('PASS: test-navigate');
process.exit(0);
