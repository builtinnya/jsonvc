'use strict';

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

module.exports = {
  isArray: isArray,
  isObject: isObject,
  cloneArray: cloneArray,
  range: range
};
