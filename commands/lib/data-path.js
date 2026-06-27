// 1. Constants

var PATH = require('path');

// 2. Variable initialization — none

// 3. Main workflow functions

function getDataDir() {
  var envDir = process.env.IDEA_DATA_DIR;
  if (envDir) {
    return envDir;
  }
  var projectRoot = PATH.resolve(__dirname, '..', '..');
  return PATH.join(projectRoot, 'data');
}

function getIdeaDir(name) {
  return PATH.join(getDataDir(), name);
}

// 4. Subworkflow functions — none

module.exports = {
  getDataDir: getDataDir,
  getIdeaDir: getIdeaDir
};
