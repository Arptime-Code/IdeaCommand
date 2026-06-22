var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
if (!testRoot) {
  console.log('FAIL: IDEA_TEST_ROOT not set');
  process.exit(1);
}

var dataDir = PATH.join(testRoot, 'tree-utils-data');
FS.mkdirSync(dataDir, { recursive: true });

process.env.IDEA_DATA_DIR = dataDir;

var treeUtils = require('../../commands/content/tree-utils');

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup tree structure:
// root/
//   cooking/
//     pasta/
//       spaghetti
//     pizza
//   programming/
//     javascript

function setupTree() {
  FS.mkdirSync(PATH.join(dataDir, 'root'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'cooking'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'pasta'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'spaghetti'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'pizza'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'programming'), { recursive: true });
  FS.mkdirSync(PATH.join(dataDir, 'javascript'), { recursive: true });

  // Create content files (serve as both link and content storage)
  FS.writeFileSync(PATH.join(dataDir, 'root', 'cooking.json'), JSON.stringify({ entries: [] }));
  FS.writeFileSync(PATH.join(dataDir, 'root', 'programming.json'), JSON.stringify({ entries: [] }));
  FS.writeFileSync(PATH.join(dataDir, 'cooking', 'pasta.json'), JSON.stringify({ entries: [] }));
  FS.writeFileSync(PATH.join(dataDir, 'cooking', 'pizza.json'), JSON.stringify({ entries: [] }));
  FS.writeFileSync(PATH.join(dataDir, 'pasta', 'spaghetti.json'), JSON.stringify({ entries: [] }));
  FS.writeFileSync(PATH.join(dataDir, 'programming', 'javascript.json'), JSON.stringify({ entries: [] }));
}

setupTree();

// Test 1: findParent of root (no parent)
var parent = treeUtils.findParent('root');
assert(parent === null, 'root should have no parent');

// Test 2: findParent of cooking
parent = treeUtils.findParent('cooking');
assert(parent === 'root', 'cooking parent should be root');

// Test 3: findParent of spaghetti
parent = treeUtils.findParent('spaghetti');
assert(parent === 'pasta', 'spaghetti parent should be pasta');

// Test 4: findParent of non-existent idea
parent = treeUtils.findParent('nonexistent');
assert(parent === null, 'non-existent idea should have no parent');

// Test 5: findAbsolutePath of root
var path = treeUtils.findAbsolutePath('root');
assert(path.length === 1, 'root path should have 1 element');
assert(path[0] === 'root', 'root path should be [root]');

// Test 6: findAbsolutePath of spaghetti
path = treeUtils.findAbsolutePath('spaghetti');
assert(path.length === 4, 'spaghetti path should have 4 elements');
assert(path[0] === 'root', 'spaghetti path should start with root');
assert(path[1] === 'cooking', 'spaghetti path should include cooking');
assert(path[2] === 'pasta', 'spaghetti path should include pasta');
assert(path[3] === 'spaghetti', 'spaghetti path should end with spaghetti');

// Test 7: findAbsolutePath of programming
path = treeUtils.findAbsolutePath('programming');
assert(path.length === 2, 'programming path should have 2 elements');
assert(path[1] === 'programming', 'programming path should end with programming');

// Test 8: findAbsolutePath of non-existent returns empty array
path = treeUtils.findAbsolutePath('nonexistent');
assert(path.length === 0, 'non-existent should return empty array');

// Test 9: childExists — valid
assert(treeUtils.childExists('root', 'cooking') === true, 'cooking should be child of root');

// Test 10: childExists — invalid
assert(treeUtils.childExists('root', 'javascript') === false, 'javascript should not be child of root');

// Test 11: childExists — non-existent parent
assert(treeUtils.childExists('nonexistent', 'child') === false, 'non-existent parent should return false');

// Test 12: listChildren of root
var children = treeUtils.listChildren('root');
assert(children.length === 2, 'root should have 2 children');
assert(children[0] === 'cooking', 'first child should be cooking');
assert(children[1] === 'programming', 'second child should be programming');

// Test 13: listChildren of cooking
children = treeUtils.listChildren('cooking');
assert(children.length === 2, 'cooking should have 2 children');
assert(children[0] === 'pasta', 'first child should be pasta');
assert(children[1] === 'pizza', 'second child should be pizza');

// Test 14: listChildren of non-existent idea
children = treeUtils.listChildren('nonexistent');
assert(children.length === 0, 'non-existent idea should have no children');

// Test 15: listChildren of empty idea
FS.mkdirSync(PATH.join(dataDir, 'empty'), { recursive: true });
children = treeUtils.listChildren('empty');
assert(children.length === 0, 'empty idea should have no children');

console.log('PASS: test-tree-utils');
process.exit(0);
