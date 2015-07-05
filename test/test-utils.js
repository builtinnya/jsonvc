'use strict';

var should = require('chai').should();

var _ = require('../src/utils');

describe('utils', function() {
  describe('#isArray', function() {
    it('should return true if an array is given', function() {
      _.isArray([]).should.be.equal(true);
      _.isArray([ 1 ]).should.be.equal(true);
      _.isArray([ 'cat', 'dog', 1.0, false ]).should.be.equal(true);
    });

    it('should return false if a non-array object is given', function() {
      _.isArray(1).should.be.equal(false);
      _.isArray('cat').should.be.equal(false);
      _.isArray(true).should.be.equal(false);
      _.isArray({}).should.be.equal(false);
      _.isArray({ cat: 'Meow!' }).should.be.equal(false);
    });
  });

  describe('#isObject', function() {
    it('should return true if a non-array object is given', function() {
      _.isObject({}).should.be.equal(true);
      _.isObject({ dog: 'Bow!' }).should.be.equal(true);
    });

    it('should return false if an array is given', function() {
      _.isObject([]).should.be.equal(false);
      _.isObject([ 1 ]).should.be.equal(false);
    });

    it('should return false if a primitive value is given', function() {
      _.isObject(1).should.be.equal(false);
      _.isObject('cat').should.be.equal(false);
      _.isObject(true).should.be.equal(false);
    });
  });

  describe('#cloneArray', function() {
    it('should shallow-copy a given array correctly', function() {
      var sourceArray = [ 1, { a: 2 }, 3 ];
      var newArray = _.cloneArray(sourceArray);
      newArray.should.be.eql(sourceArray);

      newArray[2] = 4;
      sourceArray.should.be.eql([ 1, { a: 2 }, 3 ]);

      newArray[1].a = 3;
      sourceArray.should.be.eql([ 1, { a: 3 }, 3 ]);
    });
  });

  describe('#deepClone', function() {
    it('should deep-copy an object correctly', function() {
      var obj1 = { a: [ { b: 1 }, { b: 2 } ], c: { d: 3 } };
      var obj2 = _.deepClone(obj1);
      obj1.a[0].b = 2;
      obj1.a.splice(1, 1);
      obj1.c.d = 4;
      obj2.should.be.eql({ a: [ { b: 1 }, { b: 2 } ], c: { d: 3 } });
    });
  });

  describe('#merge', function() {
    it('should merge two objects correctly', function() {
      var dest = { a: 1, b: 1 };
      var source = { b: 2, c: 3 };
      _.merge(dest, source).should.eql({ a: 1, b: 2, c: 3 });
    });
  });

  describe('#range', function() {
    it('should return an empty array if a number less than 1 is given', function() {
      _.range(0).should.be.eql([]);
      _.range(-42).should.be.eql([]);
    });

    it('should return an array of integers from 0 to n (exclusive)', function() {
      _.range(1).should.be.eql([ 0 ]);
      _.range(5).should.be.eql([ 0, 1, 2, 3, 4 ]);
    });
  });
});
