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

// Setup: create parent, child, content file, and navigate to parent
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });
FS.mkdirSync(stateDir, { recursive: true });
FS.writeFileSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json'), JSON.stringify({ entries: [] }));
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'pizza' }));

// Test 1: Unlink existing child from current node
var result = cli(['unlink', 'sauce']);
assert(result.code === 0, 'unlink sauce from current node should succeed');
assert(!FS.existsSync(PATH.join(testRoot, 'data', 'pizza', 'sauce.json')), 'sauce.json should be removed');

// Test 2: Unlink non-existent content
result = cli(['unlink', 'sauce']);
assert(result.code !== 0, 'unlink already removed content should fail');

// Test 3: Unlink with no args
result = cli(['unlink']);
assert(result.code !== 0, 'unlink with no args should fail');

// Test 4: Unlink with no navigate state
var cleanStateDir = PATH.join(testRoot, 'clean-state');
FS.mkdirSync(cleanStateDir, { recursive: true });
result = CHILD_PROCESS.spawnSync('node', [indexJs, 'unlink', 'child'], {
  env: Object.assign({}, process.env, {
    IDEA_DATA_DIR: PATH.join(testRoot, 'data'),
    IDEA_STATE_DIR: cleanStateDir
  })
});
assert(result.status !== 0, 'unlink with no navigate state should fail');

console.log('PASS: test-unlink');
process.exit(0);
