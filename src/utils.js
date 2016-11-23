'use strict';

var uuid = require('uuid');

/**
 * Returns true iff the argument is an array.
 *
 * @param {Object} x
 * @returns {boolean} True iff the argument is an array.
 */
var isArray = function isArray(x) {
  return Object.prototype.toString.call(x) === '[object Array]';
};

/**
 * Returns true iff the argument is an object and is not an array.
 *
 * @param {Object} x
 * @returns {boolean} True iff the argument is an object and is not an array.
 */
var isObject = function isObject(x) {
  return x !== null && !isArray(x) && typeof x === 'object';
};

/**
 * Returns a new copy of the given array.
 *
 * @param {Array} x
 * @returns {Array} A shallow clone of the given array.
 */
var cloneArray = function cloneArray(x) {
  return x.slice(0);
};

/**
 * Returns a new deep copy of the given plain object.
 *
 * @param {Object} x
 * @returns {Object}
 */
var deepClone = function deepClone(x) {
  return JSON.parse(JSON.stringify(x));
};

/**
 * Merges objects by assigning source's properties to the destination object.
 *
 * @param {Object} dest
 * @param {Object} source
 * @returns {Object} Mutated destination object
 */
var merge = function merge(dest, source) {
  var sourceKeys = Object.keys(source);

  sourceKeys.forEach(function(sourceKey) {
    dest[sourceKey] = source[sourceKey];
  });

  return dest;
};

/**
 * Returns an array of integers from 0 to n (exclusive).
 *
 * @param {number} n - An integer.
 * @returns {Array} An array of integers from 0 to n (exclusive).
 */
var range = function range(n) {
  var result = [];

  for (var i = 0; i < n; ++i) {
    result.push(i);
  }

  return result;
};

/**
 * Returns the number of milliseconds since January 1970 00:00:00 UTC.
 *
 * @returns {Number}
 */
var now = function now() {
  return new Date().getTime();
};

/**
 * Returns a new UUID (v4).
 *
 * @returns {String}
*/
var getUUID = function getUUID() {
  return uuid.v4();
};

module.exports = {
  isArray: isArray,
  isObject: isObject,
  cloneArray: cloneArray,
  deepClone: deepClone,
  merge: merge,
  range: range,
  now: now,
  getUUID: getUUID
};
