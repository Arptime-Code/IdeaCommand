var PATH = require('path');
var FS = require('fs');

var testRoot = process.env.IDEA_TEST_ROOT;
if (!testRoot) {
  console.log('FAIL: IDEA_TEST_ROOT not set');
  process.exit(1);
}

var dataDir = PATH.join(testRoot, 'content-store-data');
FS.mkdirSync(dataDir, { recursive: true });

// Override the data path for testing
process.env.IDEA_DATA_DIR = dataDir;

var store = require('../../commands/content/content-store');

function assert(condition, message) {
  if (!condition) {
    console.log('FAIL: ' + message);
    process.exit(1);
  }
}

// Setup: create parent and child directories
FS.mkdirSync(PATH.join(dataDir, 'test-parent'), { recursive: true });
FS.mkdirSync(PATH.join(dataDir, 'test-child'), { recursive: true });

// Test 1: Load content of a child with no file yet (no test-parent/test-child.json)
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries.length === 0, 'new child should have empty entries');

// Test 2: Add a text entry
var textEntry = {
  type: 'text',
  content: 'Hello world'
};
var result = store.addEntry('test-parent', 'test-child', textEntry);
assert(result.success === true, 'addEntry should succeed');
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries.length === 1, 'should have 1 entry');
assert(data.entries[0].type === 'text', 'entry should be text');
assert(data.entries[0].content === 'Hello world', 'content should match');

// Test 3: Add a value-from-node entry
var valueEntry = {
  type: 'value-from-node',
  parentName: 'parent',
  childName: 'child'
};
result = store.addEntry('test-parent', 'test-child', valueEntry);
assert(result.success === true, 'addEntry should succeed');
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries.length === 2, 'should have 2 entries');
assert(data.entries[1].type === 'value-from-node', 'second entry should be value-from-node');
assert(data.entries[1].parentName === 'parent', 'parentName should match');
assert(data.entries[1].childName === 'child', 'childName should match');

// Test 4: Update an entry
var updatedText = {
  type: 'text',
  content: 'Updated content'
};
result = store.updateEntry('test-parent', 'test-child', 0, updatedText);
assert(result.success === true, 'updateEntry should succeed');
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries[0].content === 'Updated content', 'content should be updated');

// Test 5: Update with invalid index
result = store.updateEntry('test-parent', 'test-child', 99, textEntry);
assert(result.success === false, 'updateEntry with invalid index should fail');
assert(result.error.indexOf('out of range') !== -1, 'should indicate out of range');

// Test 6: Update with negative index
result = store.updateEntry('test-parent', 'test-child', -1, textEntry);
assert(result.success === false, 'updateEntry with negative index should fail');

// Test 7: Remove an entry
result = store.removeEntry('test-parent', 'test-child', 1);
assert(result.success === true, 'removeEntry should succeed');
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries.length === 1, 'should have 1 entry after removal');
assert(data.entries[0].type === 'text', 'remaining entry should be text');

// Test 8: Remove with invalid index
result = store.removeEntry('test-parent', 'test-child', 99);
assert(result.success === false, 'removeEntry with invalid index should fail');

// Test 9: Remove with negative index
result = store.removeEntry('test-parent', 'test-child', -1);
assert(result.success === false, 'removeEntry with negative index should fail');

// Test 10: Get entry count
var count = store.getEntryCount('test-parent', 'test-child');
assert(count === 1, 'getEntryCount should return 1');

// Test 11: Save content to non-existent parent
result = store.saveContent('nonexistent', 'test-child', { entries: [] });
assert(result.success === false, 'saveContent to non-existent parent should fail');
assert(result.error.indexOf('not found') !== -1, 'should indicate not found');

// Test 12: Load content of non-existent child returns empty
data = store.loadContent('test-parent', 'nonexistent');
assert(data.entries.length === 0, 'non-existent child should have empty entries');

// Test 13: Save and reload persists correctly
var complexData = {
  entries: [
    { type: 'text', content: 'Line 1\nLine 2\nLine 3' },
    { type: 'value-from-node', parentName: 'a', childName: 'b' }
  ]
};
result = store.saveContent('test-parent', 'test-child', complexData);
assert(result.success === true, 'saveContent should succeed');
var data = store.loadContent('test-parent', 'test-child');
assert(data.entries.length === 2, 'should have 2 entries after save');
assert(data.entries[0].content === 'Line 1\nLine 2\nLine 3', 'multi-line content should persist');

console.log('PASS: test-content-store');
process.exit(0);
