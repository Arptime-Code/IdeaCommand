// 1. Constants
var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;

// 2. Variable initialization — none

// 3. Main workflow functions

// Load entries for a child stored under a parent
// File: data/<parent>/<child>.json
// Returns { entries: [] } if file is missing or invalid
function loadContent(parentName, childName) {
  var parentDir = getIdeaDir(parentName);
  var contentPath = PATH.join(parentDir, childName + '.json');

  try {
    var content = FS.readFileSync(contentPath, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    return { entries: [] };
  }
}

// Save data object (with entries array) to a child's content file
// Returns { success: true } or { success: false, error: "..." }
function saveContent(parentName, childName, data) {
  var parentDir = getIdeaDir(parentName);

  if (!FS.existsSync(parentDir)) {
    return { success: false, error: 'Parent idea not found: ' + parentName };
  }

  var contentPath = PATH.join(parentDir, childName + '.json');

  try {
    var raw = JSON.stringify(data, null, 2);
    FS.writeFileSync(contentPath, raw, 'utf8');
    return { success: true };
  } catch (err) {
    return { success: false, error: 'Error saving content: ' + err.message };
  }
}

// 4. Subworkflow functions

// Add one entry to the end of a child's content file
// Returns the save result
function addEntry(parentName, childName, entry) {
  var data = loadContent(parentName, childName);
  data.entries.push(entry);
  return saveContent(parentName, childName, data);
}

// Update entry at a given index
// Returns the save result
function updateEntry(parentName, childName, index, entry) {
  var data = loadContent(parentName, childName);

  if (index < 0 || index >= data.entries.length) {
    return { success: false, error: 'Entry index out of range: ' + index };
  }

  data.entries[index] = entry;
  return saveContent(parentName, childName, data);
}

// Remove entry at a given index
// Returns the save result
function removeEntry(parentName, childName, index) {
  var data = loadContent(parentName, childName);

  if (index < 0 || index >= data.entries.length) {
    return { success: false, error: 'Entry index out of range: ' + index };
  }

  data.entries.splice(index, 1);
  return saveContent(parentName, childName, data);
}

// Count entries for a child
function getEntryCount(parentName, childName) {
  var data = loadContent(parentName, childName);
  return data.entries.length;
}

module.exports = {
  loadContent: loadContent,
  saveContent: saveContent,
  addEntry: addEntry,
  updateEntry: updateEntry,
  removeEntry: removeEntry,
  getEntryCount: getEntryCount
};
