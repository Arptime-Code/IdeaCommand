// 1. Constants
var FS = require('fs');
var PATH = require('path');
var getIdeaDir = require('../lib/data-path').getIdeaDir;
var getDataDir = require('../lib/data-path').getDataDir;

// 2. Variable initialization — none

// 3. Main workflow functions

// Find which parent idea has a content file for this child
// Returns parent name or null if not found
function findParent(ideaName) {
  var dataDir = getDataDir();

  if (!FS.existsSync(dataDir)) {
    return null;
  }

  var entries = FS.readdirSync(dataDir);

  for (var i = 0; i < entries.length; i++) {
    var contentPath = PATH.join(dataDir, entries[i], ideaName + '.json');

    if (FS.existsSync(contentPath)) {
      return entries[i];
    }
  }

  return null;
}

// Build the full path from root to this idea as an array of names
// Returns [] if idea directory does not exist or circular links found
function findAbsolutePath(ideaName) {
  var ideaDir = getIdeaDir(ideaName);

  if (!FS.existsSync(ideaDir)) {
    return [];
  }

  var path = [];
  var current = ideaName;
  var visited = {};

  while (current) {
    // Avoid infinite loops from circular links
    if (visited[current]) {
      return [];
    }

    visited[current] = true;
    path.unshift(current);

    var parent = findParent(current);

    if (!parent) {
      break;
    }

    current = parent;
  }

  return path;
}

// 4. Subworkflow functions

// Check if childName exists as a child of parentName (via .json content file)
function childExists(parentName, childName) {
  var parentDir = getIdeaDir(parentName);
  var contentPath = PATH.join(parentDir, childName + '.json');
  return FS.existsSync(contentPath);
}

// List all children of a parent idea (from .json content files)
// Returns sorted array of child names
function listChildren(parentName) {
  var parentDir = getIdeaDir(parentName);

  if (!FS.existsSync(parentDir)) {
    return [];
  }

  var entries = FS.readdirSync(parentDir);
  var children = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];

    if (entry.length > 5 && entry.slice(-5) === '.json') {
      children.push(entry.slice(0, -5));
    }
  }

  children.sort();
  return children;
}

module.exports = {
  findParent: findParent,
  findAbsolutePath: findAbsolutePath,
  childExists: childExists,
  listChildren: listChildren
};
