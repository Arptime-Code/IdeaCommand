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

// Setup: create parent, child, and a content file
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json'), JSON.stringify({ entries: [] }));

// Test 1: Unlink existing link
var result = cli(['unlink', 'pizza', 'sauce']);
assert(result.code === 0, 'unlink pizza sauce should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json')), 'sauce.json should be removed');

// Test 2: Unlink non-existent content
result = cli(['unlink', 'pizza', 'sauce']);
assert(result.code !== 0, 'unlink already removed content should fail');

// Test 3: Unlink with missing args
result = cli(['unlink', 'pizza']);
assert(result.code !== 0, 'unlink with one arg should fail');

// Test 4: Unlink with no args
result = cli(['unlink']);
assert(result.code !== 0, 'unlink with no args should fail');

console.log('PASS: test-unlink');
process.exit(0);
