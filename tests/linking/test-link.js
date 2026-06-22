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

// Setup: create parent and child ideas
FS.mkdirSync(PATH.join(testRoot, 'data', 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(testRoot, 'data', 'sauce'), { recursive: true });

// Test 1: Link child under parent
var result = cli(['link', 'pizza', 'sauce']);
assert(result.code === 0, 'link pizza sauce should succeed');
var contentPath = PATH.join(testRoot, 'data', 'pizza', 'sauce.json');
assert(FS.existsSync(contentPath), 'sauce.json should exist under pizza');
assert(FS.statSync(contentPath).isFile(), 'sauce.json should be a file');
var content = JSON.parse(FS.readFileSync(contentPath, 'utf8'));
assert(Array.isArray(content.entries), 'content file should have entries array');

// Test 2: Link to non-existent parent
result = cli(['link', 'nonexistent', 'sauce']);
assert(result.code !== 0, 'link to nonexistent parent should fail');

// Test 3: Link with missing args
result = cli(['link', 'pizza']);
assert(result.code !== 0, 'link with one arg should fail');

// Test 4: Link with no args
result = cli(['link']);
assert(result.code !== 0, 'link with no args should fail');

// Test 5: Link with invalid parent name
result = cli(['link', 'pizza/crust', 'sauce']);
assert(result.code !== 0, 'link with invalid parent name should fail');

// Test 6: Link with invalid child name
result = cli(['link', 'pizza', 'sauce/topping']);
assert(result.code !== 0, 'link with invalid child name should fail');

console.log('PASS: test-link');
process.exit(0);
