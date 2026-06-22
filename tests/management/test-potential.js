var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
var indexJs = process.env.IDEA_INDEX_PATH;
var stateDir = PATH.join(testRoot, 'state');

function cli(args) {
  var env = Object.assign({}, process.env, {
    IDEA_DATA_DIR: PATH.join(testRoot, 'data'),
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

// Setup state directory and ensure env var is set before loading modules
FS.mkdirSync(stateDir, { recursive: true });
process.env.IDEA_STATE_DIR = stateDir;

// Test 1: List potential ideas when empty
var result = cli(['potential', 'list']);
assert(result.code === 0, 'potential list should succeed');
assert(result.stdout.indexOf('No potential ideas') !== -1, 'should show empty message');

// Test 2: Run potential with no args
result = cli(['potential']);
assert(result.code !== 0, 'potential with no args should fail');
assert(result.stdout.indexOf('Usage') !== -1, 'should show usage');

// Test 3: Run potential with unknown subcommand
result = cli(['potential', 'unknown']);
assert(result.code !== 0, 'potential with unknown subcommand should fail');

// Test 4: Remove non-existent idea
result = cli(['potential', 'remove', 'nonexistent']);
assert(result.code !== 0, 'remove nonexistent should fail');

// Test 5: Remove with no name
result = cli(['potential', 'remove']);
assert(result.code !== 0, 'potential remove with no name should fail');

// Test 6: Add a potential idea directly via the module
var potentialModule = require('../../commands/management/potential');
potentialModule.addPotentialIdea('test-idea');
potentialModule.addPotentialIdea('another-idea');

// Test 7: List with items
result = cli(['potential', 'list']);
assert(result.code === 0, 'potential list with items should succeed');
assert(result.stdout.indexOf('test-idea') !== -1, 'should show test-idea');
assert(result.stdout.indexOf('another-idea') !== -1, 'should show another-idea');

// Test 8: Remove an existing idea
result = cli(['potential', 'remove', 'test-idea']);
assert(result.code === 0, 'potential remove existing should succeed');

result = cli(['potential', 'list']);
assert(result.code === 0, 'potential list after remove should succeed');
assert(result.stdout.indexOf('test-idea') === -1, 'test-idea should be gone');
assert(result.stdout.indexOf('another-idea') !== -1, 'another-idea should remain');

console.log('PASS: test-potential');
process.exit(0);
