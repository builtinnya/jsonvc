'use strict';

var VDoc = require('./vdoc');

/**
 * Creates and initializes a new versioned document.
 *
 * @param {Object} doc
 * @returns {Object} Versioned document.
 */
var init = function init(doc) {
  return (new VDoc()).init(doc);
};

/**
 * Loads an existing versioned document.
 *
 * @param {Object} doc
 * @param {Object} repository
 * @returns {Object} Versioned document.
 */
var load = function load(doc, repository) {
  return (new VDoc()).load(doc, repository);
};

module.exports = {
  init: init,
  load: load
};
