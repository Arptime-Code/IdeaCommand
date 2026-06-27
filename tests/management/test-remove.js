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

// Setup: create ideas and links (using .json format)
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'cheese'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'topping'), { recursive: true });
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json'), '');
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'cheese.json'), '');
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'topping.json'), '');

// Test 1: Remove an idea with no links to it
var result = cli(['remove', 'cheese']);
assert(result.code === 0, 'remove cheese should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'cheese')), 'cheese folder should be gone');

// Test 2: Remove an idea and verify links to it are cleaned (using .json)
result = cli(['remove', 'sauce']);
assert(result.code === 0, 'remove sauce should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'sauce')), 'sauce folder should be gone');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json')), 'link to sauce should be gone');

// Test 3: Remove child instance only — keep the node and other instances
result = cli(['remove', 'pizza', 'topping']);
assert(result.code === 0, 'remove pizza topping should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'pizza', 'topping.json')), 'topping instance should be gone');
assert(FS.existsSync(PATH.join(testRoot, 'data', 'topping')), 'topping node folder should still exist');

// Test 4: Remove child instance with non-existent parent
result = cli(['remove', 'nonexistent', 'topping']);
assert(result.code !== 0, 'remove on non-existent parent should fail');

// Test 5: Remove child instance with non-existent child under parent
result = cli(['remove', 'pizza', 'nonexistent']);
assert(result.code !== 0, 'remove non-existent child should fail');

// Test 6: Remove non-existent idea
result = cli(['remove', 'nonexistent']);
assert(result.code !== 0, 'remove nonexistent should fail');

// Test 7: Remove with empty name
result = cli(['remove', '']);
assert(result.code !== 0, 'remove with empty name should fail');

// Test 8: Remove with no args
result = cli(['remove']);
assert(result.code !== 0, 'remove with no args should fail');

console.log('PASS: test-remove');
process.exit(0);
