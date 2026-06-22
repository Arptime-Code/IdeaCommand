var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
var indexJs = process.env.IDEA_INDEX_PATH;

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

function makeCli(dataDir) {
  return function(args) {
    var env = Object.assign({}, process.env, {
      IDEA_DATA_DIR: dataDir
    });
    var result = CHILD_PROCESS.spawnSync('node', [indexJs].concat(args), { env: env });
    return {
      code: result.status,
      stdout: result.stdout.toString(),
      stderr: result.stderr.toString()
    };
  };
}

// Test 1: Find by prefix match — numbered
var dir1 = PATH.join(testRoot, 'find-prefix');
FS.mkdirSync(PATH.join(dir1, 'pizza'), { recursive: true });
FS.mkdirSync(PATH.join(dir1, 'programming'), { recursive: true });
FS.mkdirSync(PATH.join(dir1, 'pasta'), { recursive: true });
var cli = makeCli(dir1);

var result = cli(['find', 'pizz']);
assert(result.code === 0, 'find pizz should succeed');
assert(result.stdout.indexOf('1. pizza') !== -1, 'first should be 1. pizza');

var lines = result.stdout.trim().split('\n');
assert(lines.length === 10, 'find should always output 10 lines');

// Test 2: Find with multiple prefix matches
result = cli(['find', 'p']);
assert(result.code === 0, 'find p should succeed');
assert(result.stdout.indexOf('pizza') !== -1, 'should find pizza');
assert(result.stdout.indexOf('programming') !== -1, 'should find programming');
assert(result.stdout.indexOf('pasta') !== -1, 'should find pasta');

// Test 3: No matching chars — still returns 10 numbered lines
result = cli(['find', 'xyz']);
assert(result.code === 0, 'find xyz should succeed');
var xyzLines = result.stdout.trim().split('\n');
assert(xyzLines.length === 10, 'should always output 10 lines');
assert(xyzLines[0] === '1. pasta', 'alphabetically first');
assert(xyzLines[1] === '2. pizza', 'alphabetically second');
assert(xyzLines[2] === '3. programming', 'alphabetically third');
assert(xyzLines[9].indexOf('10.') !== -1, 'tenth should be empty');
assert(xyzLines[9].slice(3).trim().length === 0, 'tenth should have no name');

// Test 4: Find with no args
result = cli(['find']);
assert(result.code !== 0, 'find with no args should fail');

// Test 5: Find in empty data dir
var emptyRoot = PATH.join(testRoot, 'find-empty');
FS.mkdirSync(emptyRoot, { recursive: true });
var emptyCli = makeCli(emptyRoot);
result = emptyCli(['find', 'test']);
assert(result.code === 0, 'find in empty data should succeed');
assert(result.stdout.indexOf('No ideas found') !== -1, 'should show no ideas message');

// Test 6: Ranking — exact match should be first
var dir2 = PATH.join(testRoot, 'find-ranked');
FS.mkdirSync(PATH.join(dir2, 'exact-match'), { recursive: true });
FS.mkdirSync(PATH.join(dir2, 'match-exact'), { recursive: true });
var rankedCli = makeCli(dir2);
result = rankedCli(['find', 'exact-match']);
assert(result.code === 0, 'find exact-match should succeed');
lines = result.stdout.trim().split('\n');
assert(lines[0] === '1. exact-match', 'exact match should be first result');

console.log('PASS: test-find');
process.exit(0);
