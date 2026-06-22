var CHILD_PROCESS = require('child_process');
var PATH = require('path');
var FS = require('fs');

var TEST_ROOT = PATH.join(__dirname, '..', 'tmp-test-' + Date.now());
var INDEX_PATH = PATH.join(__dirname, '..', 'commands', 'cli.js');

FS.mkdirSync(TEST_ROOT, { recursive: true });

var testPaths = [
  'management/test-new',
  'management/test-remove',
  'management/test-questions',
  'management/test-potential',
  'linking/test-link',
  'linking/test-unlink',
  'browsing/test-list',
  'browsing/test-find',
  'navigation/test-navigate',
  'content/test-content-store',
  'content/test-tree-utils',
  'content/test-compile',
  'test-repl'
];

var allPassed = true;

for (var i = 0; i < testPaths.length; i++) {
  var testFile = PATH.join(__dirname, testPaths[i] + '.js');
  var testEnv = Object.assign({}, process.env, {
    IDEA_TEST_ROOT: TEST_ROOT,
    IDEA_INDEX_PATH: INDEX_PATH,
    IDEA_STATE_DIR: PATH.join(TEST_ROOT, 'state')
  });

  var result = CHILD_PROCESS.spawnSync('node', [testFile], {
    env: testEnv,
    stdio: 'inherit'
  });

  if (result.status !== 0) {
    console.log('\nFAILED: ' + testPaths[i]);
    allPassed = false;
  } else {
    console.log('\nPASSED: ' + testPaths[i]);
  }
}

FS.rmSync(TEST_ROOT, { recursive: true, force: true });

if (allPassed) {
  console.log('\nAll tests passed.');
  process.exit(0);
} else {
  console.log('\nSome tests failed.');
  process.exit(1);
}
