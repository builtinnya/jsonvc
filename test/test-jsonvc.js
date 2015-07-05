'use strict';

var should = require('chai').should();
var jsonvc = require('../src/jsonvc');

describe('jsonvc', function() {
  describe('#init', function() {
    it('should create the first commit with a given document', function() {
      var vdoc = jsonvc.init({ a: 1 });
      vdoc.should.have.property('doc').and.eql({ a: 1 });
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
    });
  });

  describe('#load', function() {
    it('should load a repository correctly', function() {
      var vdoc = jsonvc.init({ a: 1 });
      var doc = vdoc.dumpDoc();
      var repository = vdoc.dump();
      var loaded = jsonvc.load(doc, repository);
      loaded.should.have.property('doc').and.eql(doc);
      loaded.should.have.property('commits').and.include.keys(vdoc.head);
    });

    it('should load a repository with options correctly', function() {
      var vdoc = jsonvc.init({ a: 1 });
      vdoc.option('idKey', 'xyzzy');
      var doc = vdoc.dumpDoc();
      var repository = vdoc.dump();
      var loaded = jsonvc.load(doc, repository);
      loaded.should.have.property('doc').and.eql(doc);
      loaded.should.have.property('commits').and.include.keys(vdoc.head);
      loaded.should.have.property('options').and.have.property('idKey', 'xyzzy');
    });
  });
});
