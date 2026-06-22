var PATH = require('path');

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

module.exports = {
  getDataDir: getDataDir,
  getIdeaDir: getIdeaDir
};
