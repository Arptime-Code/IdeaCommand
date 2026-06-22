function validateName(name) {
  if (!name || name.length === 0) {
    return 'Name cannot be empty';
  }

  if (name === '.') {
    return 'Name cannot be .';
  }

  if (name === '..') {
    return 'Name cannot be ..';
  }

  for (var i = 0; i < name.length; i++) {
    var ch = name[i];
    var isSlash = ch === '/' || ch === '\\';
    var isNull = ch === '\0';

    if (isSlash || isNull) {
      return 'Name cannot contain slashes or null characters';
    }
  }

  return null;
}

module.exports = validateName;
