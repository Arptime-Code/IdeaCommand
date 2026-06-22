var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
var indexJs = process.env.IDEA_INDEX_PATH;

function cli(args) {
  var env = Object.assign({}, process.env, {
    IDEA_DATA_DIR: PATH.join(testRoot, 'data')
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

// Setup: create ideas and links
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'cheese'), { recursive: true });
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.txt'), '');
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'cheese.txt'), '');

// Test 1: Remove an idea with no links to it
var result = cli(['remove', 'cheese']);
assert(result.code === 0, 'remove cheese should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'cheese')), 'cheese folder should be gone');

// Test 2: Remove an idea and verify links to it are cleaned
result = cli(['remove', 'sauce']);
assert(result.code === 0, 'remove sauce should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'sauce')), 'sauce folder should be gone');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.txt')), 'link to sauce should be gone');

// Test 3: Remove non-existent idea
result = cli(['remove', 'nonexistent']);
assert(result.code !== 0, 'remove nonexistent should fail');

// Test 4: Remove with empty name
result = cli(['remove', '']);
assert(result.code !== 0, 'remove with empty name should fail');

// Test 5: Remove with no args
result = cli(['remove']);
assert(result.code !== 0, 'remove with no args should fail');

console.log('PASS: test-remove');
process.exit(0);
