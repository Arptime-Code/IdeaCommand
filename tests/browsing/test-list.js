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

// Setup: create idea with links
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'cheese'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'dough'), { recursive: true });
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json'), JSON.stringify({ entries: [] }));
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'cheese.json'), JSON.stringify({ entries: [] }));

// Test 1: List links under an idea
var result = cli(['list', 'pizza']);
assert(result.code === 0, 'list pizza should succeed');
assert(result.stdout.indexOf('cheese') !== -1, 'should list cheese');
assert(result.stdout.indexOf('sauce') !== -1, 'should list sauce');

// Test 2: List idea with no links
FS.mkdirSync(PATH.join(testRoot, 'data', 'empty'), { recursive: true });
result = cli(['list', 'empty']);
assert(result.code === 0, 'list empty should succeed');
assert(result.stdout.trim().length === 0, 'empty idea should output nothing');

// Test 3: List non-existent idea
result = cli(['list', 'nonexistent']);
assert(result.code !== 0, 'list nonexistent should fail');

// Test 4: List with no args
result = cli(['list']);
assert(result.code !== 0, 'list with no args should fail');

console.log('PASS: test-list');
process.exit(0);
