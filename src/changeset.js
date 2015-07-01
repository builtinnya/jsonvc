'use strict';

var accessors = require('./accessors');
var _ = require('./utils');

var TYPE_ADD = 'A';
var TYPE_MODIFY = 'M';
var TYPE_DELETE = 'D';
var TYPE_ARRAY = 'AR';
var TYPE_ARRAY_ADD = 'AA';
var TYPE_ARRAY_MOVE = 'AM';
var TYPE_ARRAY_SUBSTITUTE = 'AS';
var TYPE_ARRAY_DELETE = 'AD';

module.exports = function(options) {
  if (!_.isObject(options)) {
    options = {};
  }

  if (!options.propertyIsEnumerable('idKey')) {
    options.idKey = 'id';
  }

  var _makeChange = function _makeChange(changeType, path, value) {
    var changeObj = {
      type: changeType,
      path: path
    };

    if (value !== undefined) {
      changeObj.value = value;
    }

    return changeObj;
  };

  var _makeAddition = function _makeAddition(path, value) {
    return _makeChange(TYPE_ADD, path, value);
  };

  var _makeModification = function _makeModification(path, value) {
    return _makeChange(TYPE_MODIFY, path, value);
  };

  var _makeDeletion = function _makeDeletion(path) {
    // Deletion doesn't care value
    return _makeChange(TYPE_DELETE, path);
  };

  var _makeArrayChange = function _makeArrayChange(path, changes) {
    return _makeChange(TYPE_ARRAY, path, changes);
  };

  var _makeArrayAddition = function _makeArrayAddition(index, value) {
    return _makeChange(TYPE_ARRAY_ADD, index, value);
  };

  var _makeArrayMove = function _makeArrayMove(to, from) {
    return _makeChange(TYPE_ARRAY_MOVE, to, from);
  };

  var _makeArraySubstitution = function _makeArraySubstitution(index, value) {
    return _makeChange(TYPE_ARRAY_SUBSTITUTE, index, value);
  };

  var _makeArrayDeletion = function _makeDeletion(index) {
    // Deletion doesn't care value
    return _makeChange(TYPE_ARRAY_DELETE, index);
  };

  var _hasIdKey = function _hasIdKey(obj) {
    var idKey = options.idKey;

    return idKey !== undefined && obj[idKey] !== undefined;
  };

  var _isEqual = function _isEqual(x, y) {
    var idKey = options.idKey;

    if (_.isObject(x) && _.isObject(y) && _hasIdKey(x) && _hasIdKey(y)) {
      return x[idKey] === y[idKey];
    } else {
      return x === y;
    }
  };

  var _makeDistanceTable = function _makeDistanceTable(array1, array2) {
    var distanceTable = [ _.range(array2.length + 1) ];

    for (var i = 1; i <= array1.length; ++i) {
      distanceTable.push([ i ]);
    }

    for (var rowIndex = 1; rowIndex <= array1.length; ++rowIndex) {
      for (var colIndex = 1; colIndex <= array2.length; ++colIndex) {
        var left = distanceTable[rowIndex][colIndex - 1];
        var upper = distanceTable[rowIndex - 1][colIndex];
        var upperLeft = distanceTable[rowIndex - 1][colIndex - 1];
        if (_isEqual(array1[rowIndex - 1], array2[colIndex - 1])) {
          distanceTable[rowIndex][colIndex] = upperLeft;
        } else {
          distanceTable[rowIndex][colIndex] = Math.min(left, upper, upperLeft) + 1;
        }
      }
    }

    return distanceTable;
  };

  var _buildValueToIndexMap = function _buildValueToIndexMap(a) {
    var mapForKeyedObjects = {};
    var mapForOthers = {};

    a.forEach(function(elem, index) {
      if (options.idKey !== undefined &&
          _.isObject(elem) &&
          elem[options.idKey] !== undefined) {
        mapForKeyedObjects[elem[options.idKey]] = index;
        return;
      }

      if (!_.isObject(elem) && !_.isArray(elem)) {
        mapForOthers[elem] = index;
        return;
      }
    });

    return function(value) {
      if (options.idKey !== undefined &&
          _.isObject(value) &&
          value[options.idKey] !== undefined) {
        return mapForKeyedObjects[value[options.idKey]];
      }

      if (!_.isObject(value) && !_.isArray(value)) {
        return mapForOthers[value];
      }

      return undefined;
    };
  };

  var _arrayModificationDetector = function _arrayModificationDetector(getIndexForValue) {
    return function(array1, array2, rowIndex, colIndex) {
      var newValue = array2[colIndex - 1];
      var valueIndex = getIndexForValue(newValue);

      if (0 <= valueIndex && valueIndex < array1.length) {
        return _makeArrayMove(colIndex - 1, valueIndex);
      } else {
        return _makeArraySubstitution(colIndex - 1, newValue);
      }
    };
  };

  var _detectArrayAddition = function _detectArrayAddition(array1, array2,
                                                           rowIndex, colIndex) {
    return _makeArrayAddition(colIndex - 1, array2[colIndex - 1]);
  };

  var _detectArrayDeletion = function _detectArrayDeletion(array1, array2,
                                                           rowIndex, colIndex) {
    return _makeArrayDeletion(rowIndex - 1);
  };

  var _diffArray = function _diffArray(array1, array2, path) {
    var changeset = [];

    var getIndexForValue = _buildValueToIndexMap(array1);
    var distanceTable = _makeDistanceTable(array1, array2);

    // The order matters
    var relatives = [
      [ -1, -1, _arrayModificationDetector(getIndexForValue) ],
      [ -1,  0, _detectArrayDeletion ],
      [ 0, -1, _detectArrayAddition ]
    ];

    var arrayChangeset = [];

    var rowIndex = array1.length;
    var colIndex = array2.length;

    while (!(rowIndex <= 0 && colIndex <= 0)) {
      var here = distanceTable[rowIndex][colIndex];
      var min = here;
      var relIndex = -1;

      // Find the next position with the minimum cost
      relatives.forEach(function(rel, index) {
        var r = rowIndex + rel[0];
        var c = colIndex + rel[1];

        if (r < 0 || c < 0) {
          return;
        }

        var d = distanceTable[r][c];

        if (d !== undefined && (relIndex === -1 || d < min)) {
          min = d;
          relIndex = index;
        }
      });

      if (min < here) {
        // Detect change
        arrayChangeset.push(relatives[relIndex][2](array1, array2,
                                                   rowIndex, colIndex));
      }

      rowIndex += relatives[relIndex][0];
      colIndex += relatives[relIndex][1];
    }

    if (arrayChangeset.length > 0) {
      arrayChangeset.reverse();
      changeset.push(_makeArrayChange(path, arrayChangeset));
    }

    // Detect object modifications of array elements if the id key is specified
    if (options.idKey !== undefined) {
      // This can be optimized but prioritize simplicity
      array1.forEach(function(elem1, index1) {
        array2.forEach(function(elem2, index2) {
          if (_.isObject(elem1) && _.isObject(elem2) &&
              elem1[options.idKey] === elem2[options.idKey]) {
            changeset.push.apply(
              changeset,
              _baseDiff(elem1, elem2, accessors.join(path, index2))
            );
          }
        });
      });
    }

    return changeset;
  };

  var _diffObject = function _diffObject(obj1, obj2, path) {
    var changeset = [];

    var keys1 = Object.keys(obj1);
    var keys2 = Object.keys(obj2);

    keys1.forEach(function(key) {
      if (obj2.propertyIsEnumerable(key)) {
        // Recursively detect changes
        changeset.push.apply(
          changeset,
          _baseDiff(obj1[key], obj2[key], accessors.join(path, key))
        );
      } else {
        // Deletion detected
        changeset.push(_makeDeletion(accessors.join(path, key)));
      }
    });

    keys2.forEach(function(key) {
      if (!obj1.propertyIsEnumerable(key)) {
        // Addition detected
        changeset.push(_makeAddition(accessors.join(path, key), obj2[key]));
      }
    });

    return changeset;
  };

  var _diffOther = function _diffOther(obj1, obj2, path) {
    if (obj1 !== obj2) {
      return [ _makeModification(path, obj2) ];
    } else {
      return [];
    }
  };

  var _baseDiff = function _baseDiff(obj1, obj2, path) {
    if (_.isArray(obj1) && _.isArray(obj2)) {
      return _diffArray(obj1, obj2, path);
    }

    if (_.isObject(obj1) && _.isObject(obj2)) {
      return _diffObject(obj1, obj2, path);
    }

    return _diffOther(obj1, obj2, path);
  };

  var _patchers = {};

  _patchers[TYPE_ADD] = function(change, obj) {
    return accessors.put(obj, change.path, change.value);
  };

  _patchers[TYPE_MODIFY] = function(change, obj) {
    return accessors.put(obj, change.path, change.value);
  };

  _patchers[TYPE_DELETE] = function(change, obj) {
    return accessors.del(obj, change.path);
  };

  var _arrayPatchers = {};

  _arrayPatchers[TYPE_ARRAY_ADD] = function(change, origArray, array) {
    array.splice(change.path, 0, change.value);
  };

  _arrayPatchers[TYPE_ARRAY_MOVE] = function(change, origArray, array) {
    array[change.path] = origArray[change.value];
  };

  _arrayPatchers[TYPE_ARRAY_SUBSTITUTE] = function(change, origArray, array) {
    array[change.path] = change.value;
  };

  _arrayPatchers[TYPE_ARRAY_DELETE] = function(change, origArray, array) {
    array.splice(change.path, 1);
  };

  _patchers[TYPE_ARRAY] = function(change, obj) {
    var array = accessors.get(obj, change.path);
    var origArray = _.cloneArray(array);

    change.value.forEach(function(arrayChange) {
      var arrayPatcher = _arrayPatchers[arrayChange.type];
      arrayPatcher(arrayChange, origArray, array);
    });

    return obj;
  };

  /**
   * Returns an array of change objects from obj1 to obj2.
   *
   * @param {Object} obj1
   * @param {Object} obj2
   * @returns {Array} An array of change objects.
   */
  var diff = function diff(obj1, obj2) {
    return _baseDiff(obj1, obj2, '');
  };

  /**
   * Modifies the given object according to the given changes and
   * returns modified object.
   *
   * @param {Array} changes
   * @param {Object} obj
   * @returns {Object} Modified object.
   */
  var patch = function patch(changes, obj) {
    changes.forEach(function(change) {
      var patcher = _patchers[change.type];
      obj = patcher(change, obj);
    });

    return obj;
  };

  return {
    diff: diff,
    patch: patch
  };
};
