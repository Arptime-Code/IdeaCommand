// Test: Derived-tag-based value path resolution with two branches
// Same path [up "root", down "content-source"] produces different
// output when compiled from different tree positions.
//
// Tree structure:
//
// root/
//   test/
//     test345/    ← tags: ["test", "test22"]
//     testContent/ ← tags: ["test", "test22", "content-dir"]
//   test22/
//     test345/    ← tags: ["test", "test22"]
//     testContent/ ← tags: ["test", "test22", "content-dir"]
//   content-dir/
//     testContent/ ← extra parent giving testContent a unique tag
//
// Under test: children test345 and testContent
//   testContent's unique tag: "content-dir" (test345 doesn't have it)
//   test345 has no unique tags (all its tags are shared)
//
// Value path from test345: [{up, "root"}, {down, "content-dir"}]
//   Up from test345 under test: verify test's tags include "root" ✓
//   Down from test: find child with unique tag "content-dir" → testContent
//
// Same path from test22:
//   Up from test345 under test22: verify test22's tags include "root" ✓
//   Down from test22: find child with unique tag "content-dir" → testContent
//
// Each testContent has DIFFERENT text content → modularity proven

var PATH = require('path');
var FS = require('fs');
var CHILD_PROCESS = require('child_process');

var testRoot = process.env.IDEA_TEST_ROOT;
if (!testRoot) {
  console.log('FAIL: IDEA_TEST_ROOT not set');
  process.exit(1);
}

var dataDir = PATH.join(testRoot, 'tag-path-data');
var stateDir = PATH.join(testRoot, 'tag-path-state');
var indexJs = process.env.IDEA_INDEX_PATH;

FS.mkdirSync(dataDir, { recursive: true });
FS.mkdirSync(stateDir, { recursive: true });

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

// Helper: set up an idea directory and write its content under a parent
function writeChildContent(parent, child, entries) {
  var parentDir = PATH.join(dataDir, parent);
  FS.mkdirSync(parentDir, { recursive: true });
  // Also create the child's own directory (so it's a valid idea)
  var childDir = PATH.join(dataDir, child);
  FS.mkdirSync(childDir, { recursive: true });
  var contentPath = PATH.join(parentDir, child + '.json');
  FS.writeFileSync(contentPath, JSON.stringify({ entries: entries }, null, 2));
}

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup the tree with a distinguishing parent "content-dir" for testContent
// This gives testContent the unique tag "content-dir" under both test and test22

// Create idea directories
FS.mkdirSync(PATH.join(dataDir, 'root'), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'test'), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'test22'), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'content-dir'), { recursive: true });

// Link test and test22 under root (so they get tag "root" via getTags)
writeChildContent('root', 'test', []);
writeChildContent('root', 'test22', []);

// Content under test branch
writeChildContent('test', 'test345', [
  {
    type: 'value-from-node',
    path: [
      { direction: 'up', tag: 'root' },
      { direction: 'down', tag: 'content-dir' }
    ]
  }
]);

writeChildContent('test', 'testContent', [
  { type: 'text', content: 'This content is from the TEST branch\n' }
]);

// Content under test22 branch — same path, different text
writeChildContent('test22', 'test345', [
  {
    type: 'value-from-node',
    path: [
      { direction: 'up', tag: 'root' },
      { direction: 'down', tag: 'content-dir' }
    ]
  }
]);

writeChildContent('test22', 'testContent', [
  { type: 'text', content: 'This content is from the TEST22 branch\n' }
]);

// Also create testContent under content-dir (gives it the unique tag)
writeChildContent('content-dir', 'testContent', []);

// Test 1: Compile from test — should output TEST branch content
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'test' }));

var result = cli(['compile']);
assert(result.code === 0, 'compile from test should succeed');
assert(result.stdout.indexOf('TEST branch') !== -1, 'test compile should contain "TEST branch"');
assert(result.stdout.indexOf('TEST22 branch') === -1, 'test compile should NOT contain "TEST22 branch"');
assert(result.stdout.indexOf('error') === -1 && result.stdout.indexOf('Error') === -1, 'test compile should have no errors');

// Test 2: Compile from test22 — should output TEST22 branch content
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'test22' }));

var result = cli(['compile']);
assert(result.code === 0, 'compile from test22 should succeed');
assert(result.stdout.indexOf('TEST22 branch') !== -1, 'test22 compile should contain "TEST22 branch"');
assert(result.stdout.indexOf('TEST branch') === -1, 'test22 compile should NOT contain "TEST branch"');
assert(result.stdout.indexOf('error') === -1 && result.stdout.indexOf('Error') === -1, 'test22 compile should have no errors');

// Test 3: Compile from test345 directly — should find test as parent (first found)
// and resolve the path correctly
FS.writeFileSync(PATH.join(stateDir, '.current-node.json'), JSON.stringify({ currentNode: 'test345' }));

var result = cli(['compile']);
assert(result.code === 0, 'compile from test345 directly should succeed');
assert(result.stdout.indexOf('TEST branch') !== -1, 'test345 compile should find TEST branch content');
assert(result.stdout.indexOf('error') === -1 && result.stdout.indexOf('Error') === -1, 'test345 compile should have no errors');

console.log('PASS: test-tag-path');
process.exit(0);
