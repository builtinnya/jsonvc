'use strict';

var changesetFactory = require('./changeset');
var _ = require('./utils');

/**
 * Versioned document.
 *
 * @constructor
 *
 */
var VDoc = function VDoc() {
  this.doc = null;
  this.commits = null;
  this.head = null;
  this.options = {};
};

VDoc.prototype = (function() {

  var _initStates = function _initStates(doc, repository) {
    this.doc = doc || null;
    this.commits = repository.commits || null;
    this.head = repository.head || null;
    this.options = repository.options || {};
  };

  var _getCommit = function _getCommit(commitId) {
    return this.commits[commitId];
  };

  var _commitExists = function _commitExists(commitId) {
    return !!_getCommit.call(this, commitId);
  };

  var _getDiff = function _getDiff(commitId) {
    var commit = _getCommit.call(this, commitId);
    return commit.diff;
  };

  var _getParent = function _getParent(commitId) {
    var commit = _getCommit.call(this, commitId);
    return commit.parent;
  };

  var _makeCommit = function _makeCommit(parent, diff, params) {
    var id = _.getUUID(); // must be id !== parent
    var timeInMillis = _.now();

    var commitObj = {
      id: id,
      parent: parent,
      diff: diff,
      createdAt: timeInMillis
    };

    return _.merge(commitObj, params || {});
  };

  var _changeset = function _changeset() {
    return changesetFactory(this.options.changeset || {});
  };

  /**
   * Gets/sets the specified option's value.
   *
   * @param {String} name - the option's name.
   * @param {} value - Sets the option's value if specified.
   * @returns {} The option's value.
   */
  var option = function option(name, value) {
    if (value !== undefined) {
      this.options[name] = value;
    }

    return this.options[name];
  };

  /**
   * Creates the first commit with the specified document.
   *
   * @param {Object} doc
   * @param {Object} options
   * @returns {Object} this
   */
  var init = function init(doc, options) {
    var firstCommit = _makeCommit.call(this, null, []);

    var commits = {};
    commits[firstCommit.id] = firstCommit;

    _initStates.call(this, doc, {
      commits: commits,
      head: firstCommit.id,
      options: options || {}
    });

    return this;
  };

  /**
   * Loads states from the specified document and repository.
   *
   * @param {Object} doc - The current document.
   * @param {Object} repository - The repository of commits.
   * @returns {Object} this
   */
  var load = function load(doc, repository) {
    _initStates.call(this, doc, repository);

    return this;
  };

  /**
   * Creates a new commit with the specified document.
   *
   * @param {Object} newDoc
   * @param {Object} params
   * @returns {Object} this
   */
  var update = function update(newDoc, params) {
    var changeset = _changeset.call(this);
    var currentDoc = this.doc;
    var diff = changeset.diff(newDoc, currentDoc);

    if (diff.length < 1) {
      // No need to update
      return this;
    }

    var newCommit = _makeCommit.call(this, this.head, diff, params);

    this.doc = newDoc;
    this.commits[newCommit.id] = newCommit;
    this.head = newCommit.id;

    return this;
  };

  /**
   * Creates a new commit to restore the document state of the specified commit.
   *
   * @param {String} commitId
   * @param {Object} params
   * @returns {Object} this or null
   */
  var restore = function restore(commitId, params) {
    if (!_commitExists.call(this, commitId)) {
      return null;
    }

    var changeset = _changeset.call(this);
    var doc = _.deepClone(this.doc);
    var id = this.head;

    while (id && id !== commitId) {
      doc = changeset.patch(_getDiff.call(this, id), doc);
      id = _getParent.call(this, id);
    }

    return this.update(doc, params);
  };

  /**
   * Returns the commit repository object.
   *
   * @returns {Object}
   */
  var dump = function dump() {
    return {
      commits: this.commits,
      head: this.head,
      options: this.options
    };
  };

  /**
   * Returns the current document object.
   *
   * @returns {Object}
   */
  var dumpDoc = function dumpDoc() {
    return this.doc;
  };

  return {
    constructor: VDoc,
    option: option,
    init: init,
    load: load,
    update: update,
    restore: restore,
    dump: dump,
    dumpDoc: dumpDoc
  };

})();

module.exports = VDoc;
