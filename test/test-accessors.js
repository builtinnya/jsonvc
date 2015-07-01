'use strict';

var chai = require('chai');
var should = chai.should();

var accessors = require('../src/accessors');

describe('accessors', function() {
  describe('#join', function() {
    it('should return a joined path correctly', function() {
      accessors.join('', 'a').should.be.equal('a');
      accessors.join('a', 'b').should.be.equal('a.b');
      accessors.join('a.b', 'c').should.be.equal('a.b.c');
    });
  });

  describe('#get', function() {
    it('should return the default value if not found', function() {
      chai.expect(accessors.get({}, 'a')).to.be.equal(undefined);
      accessors.get({}, 'a', 0).should.be.equal(0);
    });

    it('should return a correct value', function() {
      accessors.get({ a: 1 }, 'a').should.be.equal(1);
      accessors.get({ a: [ 1, 2, 3 ] }, 'a.1').should.be.equal(2);
      accessors.get({ a: { b: 3 } }, 'a.b').should.be.equal(3);
    });
  });

  describe('#put', function() {
    it('should return the given value if path is empty', function() {
      accessors.put(0, '', 1).should.be.equal(1);
      accessors.put({ a: 1 }, '', 1).should.be.equal(1);
    });

    it('should modify a property correctly', function() {
      var obj1 = { a: 1 };
      accessors.put(obj1, 'a', 2).should.be.eql({ a: 2 });
      obj1.should.be.eql({ a: 2 });

      var obj2 = { a: { b: 1 } };
      accessors.put(obj2, 'a.b', 2).should.be.eql({ a: { b: 2 } });
      obj2.should.be.eql({ a: { b: 2 } });

      var obj3 = { a: [ 1, 2 ] };
      accessors.put(obj3, 'a.0', 2).should.be.eql({ a: [ 2, 2 ] });
      obj3.should.be.eql({ a: [ 2, 2 ] });
    });
  });

  describe('#del', function() {
    it('should return undefined if path is empty', function() {
      chai.expect(accessors.del({ a: 1 }, '')).to.be.equal(undefined);
    });

    it('should delete a property correctly', function() {
      var obj1 = { a: 1 };
      accessors.del(obj1, 'a').should.be.eql({});
      obj1.should.be.eql({});

      var obj2 = { a: { b: 1 } };
      accessors.del(obj2, 'a.b').should.be.eql({ a: {} });
      obj2.should.be.eql({ a: {} });
    });
  });
});
