var FS = require('fs');
var getDataDir = require('../lib/data-path').getDataDir;

var MAX_RESULTS = 10;

function run(args) {
  if (args.length === 0) {
    return { success: false, error: 'Usage: ideaManager find <query>' };
  }

  var query = args[0].toLowerCase();
  var dataDir = getDataDir();

  if (!FS.existsSync(dataDir)) {
    console.log('No ideas found');
    return { success: true };
  }

  var entries = FS.readdirSync(dataDir);

  if (entries.length === 0) {
    console.log('No ideas found');
    return { success: true };
  }

  var scored = [];

  for (var i = 0; i < entries.length; i++) {
    var entry = entries[i];
    var score = computeScore(entry, query);
    scored.push({ name: entry, score: score });
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

  for (var j = 0; j < MAX_RESULTS; j++) {
    var number = j + 1;
    if (j < scored.length) {
      console.log(number + '. ' + scored[j].name);
    } else {
      console.log(number + '. ');
    }
  }

  return { success: true };
}

function computeScore(name, query) {
  var nameLower = name.toLowerCase();
  var score = 0;

  // Exact match — highest priority
  if (nameLower === query) {
    score += 1000;
  }

  // Prefix match
  if (nameLower.startsWith(query)) {
    score += 500;
  }

  // Substring match
  if (nameLower.indexOf(query) !== -1) {
    score += 200;
  }

  // Character-by-character ordered matching
  var matchCount = countOrderedMatches(nameLower, query);

  if (query.length > 0) {
    var fuzzyWeight = (matchCount / query.length) * 100;
    score += fuzzyWeight;
  }

  // Density bonus — matches in a shorter name are more significant
  if (nameLower.length > 0 && matchCount > 0) {
    score += (matchCount / nameLower.length) * 50;
  }

  return score;
}

function countOrderedMatches(str, query) {
  var strIndex = 0;
  var matches = 0;

  for (var q = 0; q < query.length; q++) {
    while (strIndex < str.length && str[strIndex] !== query[q]) {
      strIndex++;
    }
    if (strIndex < str.length) {
      matches++;
      strIndex++;
    }
  }

  return matches;
}

module.exports = { run: run };
