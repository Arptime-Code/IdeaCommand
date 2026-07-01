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

// Find ALL parents that have a content file for this child
// Returns array of parent names (may be empty)
function findAllParents(ideaName) {
  var dataDir = getDataDir();
  var parents = [];

  if (!FS.existsSync(dataDir)) {
    return parents;
  }

  var entries = FS.readdirSync(dataDir);

  for (var i = 0; i < entries.length; i++) {
    var contentPath = PATH.join(dataDir, entries[i], ideaName + '.json');

    if (FS.existsSync(contentPath)) {
      parents.push(entries[i]);
    }
  }

  return parents;
}

// Get tags for an idea — tags = all direct parent names across the tree
// plus the idea's own name (so every node always has at least one unique tag)
function getTags(ideaName) {
  var tags = findAllParents(ideaName);
  tags.push(ideaName);
  return tags;
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

// Find exactly one child with matching tag
// Returns child name or null if 0 or >1 children match
function findChildByUniqueTag(parentName, tag) {
  var children = listChildren(parentName);
  var matches = [];

  for (var i = 0; i < children.length; i++) {
    var childTags = getTags(children[i]);

    for (var j = 0; j < childTags.length; j++) {
      if (childTags[j] === tag) {
        matches.push(children[i]);
        break;
      }
    }
  }

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}

// Check if parent's tags include the given tag
// Root is special: parentHasTag('root', 'root') returns true
function parentHasTag(parentName, tag) {
  if (parentName === 'root' && tag === 'root') {
    return true;
  }

  var tags = getTags(parentName);

  for (var i = 0; i < tags.length; i++) {
    if (tags[i] === tag) {
      return true;
    }
  }

  return false;
}

// Get the first tag from an idea's tag list.
// Returns empty string if no tags.
// Used for display purposes in the navigator.
function getFirstTag(ideaName) {
  var tags = getTags(ideaName);

  if (tags.length > 0) {
    return tags[0];
  }

  // Special case for root
  if (ideaName === 'root') {
    return 'root';
  }

  return '';
}

module.exports = {
  findParent: findParent,
  findAllParents: findAllParents,
  getTags: getTags,
  findAbsolutePath: findAbsolutePath,
  childExists: childExists,
  listChildren: listChildren,
  findChildByUniqueTag: findChildByUniqueTag,
  parentHasTag: parentHasTag,
  getFirstTag: getFirstTag
};
