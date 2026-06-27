// 1. Constants
var FS = require('fs');

var getDataDir = require('./data-path').getDataDir;

// 2. Variable initialization — none

// 3. Main workflow function

// Run fuzzy search on all ideas, return top N results sorted by relevance
function computeTopResults(query, maxResults) {
  var dataDir = getDataDir();

  if (!FS.existsSync(dataDir)) {
    return [];
  }

  var entries = FS.readdirSync(dataDir);

  if (entries.length === 0) {
    return [];
  }

  var queryLower = query.toLowerCase();
  var scored = [];

  for (var i = 0; i < entries.length; i++) {
    var score = computeScore(entries[i], queryLower);
    scored.push({ name: entries[i], score: score });
  }

  scored.sort(function(a, b) {
    if (b.score !== a.score) {
      return b.score - a.score;
    }

    if (a.name < b.name) {
      return -1;
    }

    if (a.name > b.name) {
      return 1;
    }

    return 0;
  });

  var result = [];

  for (var j = 0; j < maxResults && j < scored.length; j++) {
    result.push({ name: scored[j].name, rank: j + 1 });
  }

  return result;
}

// 4. Subworkflow functions

// Compute a relevance score for a name against a lowercased query
function computeScore(name, queryLower) {
  var nameLower = name.toLowerCase();
  var score = 0;

  // Exact match — highest priority
  if (nameLower === queryLower) {
    score = score + 1000;
  }

  // Prefix match
  if (nameLower.startsWith(queryLower)) {
    score = score + 500;
  }

  // Substring match
  if (nameLower.indexOf(queryLower) !== -1) {
    score = score + 200;
  }

  // Character-by-character ordered matching
  var matchCount = countOrderedMatches(nameLower, queryLower);

  if (queryLower.length > 0) {
    var fuzzyWeight = (matchCount / queryLower.length) * 100;
    score = score + fuzzyWeight;
  }

  // Density bonus — matches in a shorter name are more significant
  if (nameLower.length > 0 && matchCount > 0) {
    score = score + (matchCount / nameLower.length) * 50;
  }

  return score;
}

// Count how many characters of a query appear in order within a string
function countOrderedMatches(str, query) {
  var strIndex = 0;
  var matches = 0;

  for (var queryIndex = 0; queryIndex < query.length; queryIndex++) {
    while (strIndex < str.length && str[strIndex] !== query[queryIndex]) {
      strIndex = strIndex + 1;
    }

    if (strIndex < str.length) {
      matches = matches + 1;
      strIndex = strIndex + 1;
    }
  }

  return matches;
}

module.exports = {
  computeTopResults: computeTopResults,
  computeScore: computeScore,
  countOrderedMatches: countOrderedMatches
};
