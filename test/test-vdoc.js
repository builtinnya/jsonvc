'use strict';

var chai = require('chai');
var should = chai.should();
var VDoc = require('../src/vdoc');

describe('vdoc', function() {
  describe('#init', function() {
    it('should create the first commit with a given document', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      vdoc.should.have.property('doc').and.eql({ a: 1 });
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
    });
  });

  describe('#load', function() {
    it('should load a repository correctly', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      var doc = vdoc.dumpDoc();
      var repository = vdoc.dump();
      var loaded = (new VDoc()).load(doc, repository);
      loaded.should.have.property('doc').and.eql(doc);
      loaded.should.have.property('commits').and.include.keys(vdoc.head);
    });

    it('should be initialized correctly if empty document and repository given', function() {
      var vdoc = (new VDoc()).load(null, {});
      chai.expect(vdoc.doc).to.be.equal(null);
      chai.expect(vdoc.commits).to.be.equal(null);
      chai.expect(vdoc.head).to.be.equal(null);
      chai.expect(vdoc.options).to.be.eql({});
    });
  });

  describe('#option', function() {
    it('should set and get option values correctly', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      vdoc.option('idKey', 'xyzzy');
      vdoc.option('idKey').should.be.equal('xyzzy');
    });
  });

  describe('#update', function() {
    it('should create a new commit and update the document state', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      vdoc.update({ a: 1, b: 2 });
      vdoc.doc.should.be.eql({ a: 1, b: 2 });
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
      vdoc.should.have.property('commits').and.satisfy(function(commits) {
        return Object.keys(commits).length === 2;
      });
    });

    it('should not create a commit if no difference', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      vdoc.update({ a: 1 });
      vdoc.doc.should.be.eql({ a: 1 });
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
      vdoc.should.have.property('commits').and.satisfy(function(commits) {
        return Object.keys(commits).length === 1;
      });
    });
  });

  describe('#restore', function() {
    it('should create a new commit to restore the document state of an old commit', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      var firstCommitId = vdoc.head;
      vdoc.update({ a: 1, b: 1 });
      vdoc.restore(firstCommitId);
      vdoc.doc.should.be.eql({ a: 1 });
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
      vdoc.should.have.property('commits').and.satisfy(function(commits) {
        return Object.keys(commits).length === 3;
      });
    });

    it('should return null if the specified commit does not exist in the repository', function() {
      var vdoc = (new VDoc()).init({ a: 1 });
      vdoc.update({ a: 1, b: 1 });
      var head = vdoc.head;
      chai.expect(vdoc.restore('xyzzy')).to.be.equal(null);
      vdoc.doc.should.be.eql({ a: 1, b: 1 });
      vdoc.head.should.be.equal(head);
      vdoc.should.have.property('commits').and.include.keys(vdoc.head);
      vdoc.should.have.property('commits').and.satisfy(function(commits) {
        return Object.keys(commits).length === 2;
      });
    });
  });
});
