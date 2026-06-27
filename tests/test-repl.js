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

var replDataDir = PATH.join(testRoot, 'repl-data');
var replStateDir = PATH.join(testRoot, 'repl-state');

FS.mkdirSync(replDataDir, { recursive: true });
FS.mkdirSync(replStateDir, { recursive: true });

// Create a parent idea and set navigate state so 'new' can create under it
FS.mkdirSync(PATH.join(replDataDir, 'root'), { recursive: true });
FS.writeFileSync(PATH.join(replStateDir, '.current-node.json'), JSON.stringify({ currentNode: 'root' }));

var env = Object.assign({}, process.env, {
  IDEA_DATA_DIR: replDataDir,
  IDEA_STATE_DIR: replStateDir
});

var child = CHILD_PROCESS.spawn('node', [indexJs], {
  env: env,
  stdio: ['pipe', 'pipe', 'pipe']
});

var output = '';

child.stdout.on('data', function(data) {
  output = output + data.toString();
});

var commandList = [
  // new cooking: answer y to all 3 questions
  'new cooking',
  'y',
  'y',
  'y',
  // new pizza: answer y to all 3 questions
  'new pizza',
  'y',
  'y',
  'y',
  // navigate root — should show children (cooking, pizza) and no parents
  'navigate root',
  'exit'
];

var cmdIndex = 0;

function writeNext() {
  if (cmdIndex >= commandList.length) {
    return;
  }
  child.stdin.write(commandList[cmdIndex] + '\n');
  cmdIndex = cmdIndex + 1;
  setTimeout(writeNext, 200);
}

writeNext();

var checked = false;

child.on('close', function(code) {
  // Give a tick for any remaining stdout data
  setImmediate(function() {
    assert(code === 0, 'REPL should exit with code 0');
    assert(output.indexOf('Created idea: cooking') !== -1, 'REPL should create cooking');
    assert(output.indexOf('Created idea: pizza') !== -1, 'REPL should create pizza');
    assert(output.indexOf('Navigated to: root') !== -1, 'REPL should navigate to root');
    assert(output.indexOf('Children:') !== -1, 'REPL should show children');
    assert(output.indexOf('cooking') !== -1, 'children should include cooking');
    assert(output.indexOf('pizza') !== -1, 'children should include pizza');
    console.log('PASS: test-repl');
    checked = true;
    process.exit(0);
  });
});

child.on('error', function(err) {
  console.log('FAIL: REPL spawn error: ' + err.message);
  process.exit(1);
});

// Safety timeout
setTimeout(function() {
  if (checked) {
    return;
  }
  console.log('FAIL: REPL test timed out');
  console.log('OUTPUT SO FAR:');
  console.log(output);
  child.kill();
  process.exit(1);
}, 8000);
