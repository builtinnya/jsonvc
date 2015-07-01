'use strict';

var _ = require('./utils');

var PATH_SEPARATOR = '.';

var _toParts = function _toParts(path) {
  if (path === '') {
    return [];
  } else {
    return path.split(PATH_SEPARATOR);
  }
};

/**
 * Returns a new path by joining the given path with part.
 *
 * @param {string} path
 * @param {string} part
 * @returns {string} Joined path.
 */
var join = function join(path, part) {
  if (path === '') {
    return part;
  } else {
    return path + PATH_SEPARATOR + part;
  }
};

/**
 * Returns a value extracted from the given object specified by path.
 *
 * @param {Object} obj
 * @param {string} path
 * @param {} defaultValue
 * @returns {}
 */
var get = function get(obj, path, defaultValue) {
  var parts = _toParts(path);

  for (var i = 0; i < parts.length && obj !== undefined; ++i) {
    obj = obj[parts[i]];
  }

  return obj !== undefined ? obj : defaultValue;
};

/**
 * Assigns a new value to the given path of an object.
 *
 * @param {Object} obj
 * @param {string} path
 * @param {} value
 * @returns {} The given object
 */
var put = function put(obj, path, value) {
  var parts = _toParts(path);

  var curObj = obj;

  for (var i = 0; i < parts.length - 1 && curObj !== undefined; ++i) {
    curObj = curObj[parts[i]];
  }

  if (parts.length > 0 && i >= 0 && curObj !== undefined) {
    curObj[parts[i]] = value;
  }

  return parts.length > 0 ? obj : value;
};

/**
 * Deletes a property from the object specified by path.
 *
 * @param {Object} obj
 * @param {string} path
 * @returns {} The given object
 */
var del = function del(obj, path) {
  var parts = _toParts(path);

  var curObj = obj;

  for (var i = 0; i < parts.length - 1 && curObj !== undefined; ++i) {
    curObj = curObj[parts[i]];
  }

  if (parts.length > 0 && i >= 0 && curObj !== undefined) {
    delete curObj[parts[i]];
  }

  return parts.length > 0 ? obj : undefined;
};

module.exports = {
  join: join,
  get: get,
  put: put,
  del: del
};
