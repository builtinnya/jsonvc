'use strict';

var should = require('chai').should();

var changeset = require('../src/changeset')();
var changesetWithIdKeyX = require('../src/changeset')({ idKey: 'x' });
var changesetWithoutIdKey = require('../src/changeset')({ idKey: undefined });

describe('changeset', function() {
  describe('#diff', function() {
    it('should return an empty array if two objects are same', function() {
      changeset.diff(0, 0).should.be.eql([]);
      changeset.diff('cat', 'cat').should.be.eql([]);
      changeset.diff(true, true).should.be.eql([]);
      changeset.diff([], []).should.be.eql([]);
      changeset.diff([ 1, 2 ], [ 1, 2 ]).should.be.eql([]);
      changeset.diff({}, {}).should.be.eql([]);
      changeset.diff({ a: 1, b: 2 }, { a: 1, b: 2 }).should.be.eql([]);
      changeset.diff({ a: [ { id: 1 } ] }, { a: [ { id: 1 } ] }).should.be.eql([]);
    });

    it('should detect additions', function() {
      changeset.diff({}, { a: 1 })
        .should.be.eql([ { type: 'A', path: 'a', value: 1 } ]);
      changeset.diff({ a: 1 }, { a: 1, b: 2 })
        .should.be.eql([ { type: 'A', path: 'b', value: 2 } ]);
      changeset.diff({ a: { b: 1 } }, { a: { b: 1, c: 2 }, d: 3 })
        .should.be.eql([ { type: 'A', path: 'a.c', value: 2 },
                         { type: 'A', path: 'd', value: 3 } ]);
    });

    it('should detect modifications', function() {
      changeset.diff({ a: 1 }, { a: 2 })
        .should.be.eql([ { type: 'M', path: 'a', value: 2 } ]);
      changeset.diff({ a: { b: 1 } }, { a: { b: 2 } })
        .should.be.eql([ { type: 'M', path: 'a.b', value: 2 } ]);
      changeset.diff({ a: { b: 1 }, c: 2 }, { a: { b: 2 }, c: 3 })
        .should.be.eql([ { type: 'M', path: 'a.b', value: 2 },
                         { type: 'M', path: 'c', value: 3 } ]);
    });

    it('should detect deletions', function() {
      changeset.diff({ a: 1 }, {})
        .should.be.eql([ { type: 'D', path: 'a' } ]);
      changeset.diff({ a: 1, b: 2 }, { b: 2 })
        .should.be.eql([ { type: 'D', path: 'a' } ]);
      changeset.diff({ a: { b: 1, c: 2 }, d: 3 }, { a: { b: 1 } })
        .should.be.eql([ { type: 'D', path: 'a.c' },
                         { type: 'D', path: 'd' } ]);
    });

    it('should detect array-additions', function() {
      changeset.diff([], [ 1 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AA', path: 0, value: 1 }
            ]
          }
        ]);
      changeset.diff([ 1 ], [ 2, 1 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AA', path: 0, value: 2 }
            ]
          }
        ]);
      changeset.diff([ 1 ], [ 1, 2, 3 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AA', path: 1, value: 2 },
              { type: 'AA', path: 2, value: 3 }
            ]
          }
        ]);
    });

    it('should detect array-moves', function() {
      changeset.diff([ 1, 2 ], [ 2, 1 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AM', path: 0, value: 1 },
              { type: 'AM', path: 1, value: 0 }
            ]
          }
        ]);
    });

    it('should detect array-moves of objects with id key', function() {
      changeset.diff([ { id: 1 }, { id: 2 } ], [ { id: 2 }, { id: 1 } ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AM', path: 0, value: 1 },
              { type: 'AM', path: 1, value: 0 }
            ]
          }
        ]);
      changesetWithIdKeyX.diff([ { x: 1 }, { x: 2 } ], [ { x: 2 }, { x: 1 } ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AM', path: 0, value: 1 },
              { type: 'AM', path: 1, value: 0 }
            ]
          }
        ]);
    });

    it('should detect array-substitutions', function() {
      changeset.diff([ 1 ], [ 2 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AS', path: 0, value: 2 }
            ]
          }
        ]);
      changeset.diff([ 1, 2 ], [ 1, 3 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AS', path: 1, value: 3 }
            ]
          }
        ]);
    });

    it('cannot identify an array-element without id key', function() {
      changesetWithoutIdKey.diff([ { a: 1 } ], [ { a: 1 } ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AS', path: 0, value: { a: 1 } }
            ]
          }
        ]);
    });

    it('should detect array-deletions', function() {
      changeset.diff([ 1 ], [])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AD', path: 0 }
            ]
          }
        ]);
      changeset.diff([ 1, 2 ], [ 1 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AD', path: 1 }
            ]
          }
        ]);
      changeset.diff([ 1, 2 ], [ 2 ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AD', path: 0 }
            ]
          }
        ]);
    });

    it('should detect array-element\'s changes', function() {
      changeset.diff([ { id: 1, a: 1 }, { id: 2, b: 1 } ],
                     [ { id: 2, b: 2 }, { id: 1, a: 2 } ])
        .should.be.eql([
          {
            type: 'AR',
            path: '',
            value: [
              { type: 'AM', path: 0, value: 1 },
              { type: 'AM', path: 1, value: 0 }
            ]
          },
          {
            type: 'M',
            path: '1.a',
            value: 2
          },
          {
            type: 'M',
            path: '0.b',
            value: 2
          }
        ]);
    });
  });

  describe('#patch', function() {
    it('should handle additions', function() {
      changeset.patch(changeset.diff({}, { a: 1 }), {})
        .should.be.eql({ a: 1 });
      changeset.patch(changeset.diff({ a: 1 }, { a: 1, b: 2 }), { a: 1 })
        .should.be.eql({ a: 1, b: 2 });
      changeset.patch(changeset.diff({ a: { b: 1 } }, { a: { b: 1, c: 2 }, d: 3 }), { a: { b: 1 } })
        .should.be.eql({ a: { b: 1, c: 2 }, d: 3 });
    });

    it('should handle modifications', function() {
      changeset.patch(changeset.diff({ a: 1 }, { a: 2 }), { a: 1 })
        .should.be.eql({ a: 2 });
      changeset.patch(changeset.diff({ a: { b: 1 } }, { a: { b: 2 } }), { a: { b: 1 } })
        .should.be.eql({ a: { b: 2 } });
      changeset.patch(changeset.diff({ a: { b: 1 }, c: 2 }, { a: { b: 2 }, c: 3 }), { a: { b: 1 }, c: 2 })
        .should.be.eql({ a: { b: 2 }, c: 3 });
    });

    it('should handle deletions', function() {
      changeset.patch(changeset.diff({ a: 1 }, {}), { a: 1 })
        .should.be.eql({});
      changeset.patch(changeset.diff({ a: 1, b: 2 }, { b: 2 }), { a: 1, b: 2 })
        .should.be.eql({ b: 2 });
      changeset.patch(changeset.diff({ a: { b: 1, c: 2 }, d: 3 }, { a: { b: 1 } }), { a: { b: 1, c: 2 }, d: 3 })
        .should.be.eql({ a: { b: 1 } });
    });

    it('should handle array-additions', function() {
      changeset.patch(changeset.diff([], [ 1 ]), [])
        .should.be.eql([ 1 ]);
      changeset.patch(changeset.diff([ 1 ], [ 2, 1 ]), [ 1 ])
        .should.be.eql([ 2, 1 ]);
      changeset.patch(changeset.diff([ 1 ], [ 1, 2, 3 ]), [ 1 ])
        .should.be.eql([ 1, 2, 3 ]);
    });

    it('should handle array-moves', function() {
      changeset.patch(changeset.diff([ 1, 2 ], [ 2, 1 ]), [ 1, 2 ])
        .should.be.eql([ 2, 1 ]);
    });

    it('should handle array-substitutions', function() {
      changeset.patch(changeset.diff([ 1 ], [ 2 ]), [ 1 ])
        .should.be.eql([ 2 ]);
      changeset.patch(changeset.diff([ 1, 2 ], [ 1, 3 ]), [ 1, 2 ])
        .should.be.eql([ 1, 3 ]);
    });

    it('should handle array-deletions', function() {
      changeset.patch(changeset.diff([ 1 ], []), [ 1 ])
        .should.be.eql([]);
      changeset.patch(changeset.diff([ 1, 2 ], [ 1 ]), [ 1, 2 ])
        .should.be.eql([ 1 ]);
      changeset.patch(changeset.diff([ 1, 2 ], [ 2 ]), [ 1, 2 ])
        .should.be.eql([ 2 ]);
    });

    it('should handle array-element\'s changes', function() {
      changeset.patch(changeset.diff([ { id: 1, a: 1 }, { id: 2, b: 1 } ],
                                     [ { id: 2, b: 2 }, { id: 1, a: 2 } ]),
                      [ { id: 1, a: 1 }, { id: 2, b: 1 } ])
        .should.be.eql([ { id: 2, b: 2 }, { id: 1, a: 2 } ]);
    });
  });
});
