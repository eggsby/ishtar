var assert = require("assert");
var should = require('should');

var ishtar = require("../ishtar");
ishtar.exports(global);

describe('IAssociative', function() {
  it('works on Maps', function() {
    var a = Map({a: 1, b: 2});
    has(a, "a").should.be.true;
    has(a, "z").should.be.false;
    eq(set(a, "b", 1), Map({a: 1, b: 1})).should.be.true;
    get(a, "b").should.eql(2);
  });
  it('works on Objects', function() {
    var a = {a: 1, b: 2};
    has(a, "a").should.be.true;
    has(a, "z").should.be.false;
    set(a, "b", 1).should.eql({a: 1, b: 1});
    get(a, "b").should.eql(2);
  });
});

describe('MapEntry', function() {
  it('looks like an array', function() {
    var x = MapEntry('a', 1);
    x[0].should.eql('a');
    x[1].should.eql(1);
  });
  it('looks like a seq', function() {
    var x = MapEntry('a', 1);
    first(x).should.eql('a');
    second(x).should.eql(1);
  });
  it('looks like a k/v entry', function() {
    var x = MapEntry('a', 1);
    x.key.should.eql('a');
    x.val.should.eql(1);
  });
});

describe('set', function() {
  it('accepts many key, val pairs', function() {
    var a = {};
    set(a, "a", 1, "b", 2).should.eql({a: 1, b: 2});
  });
  it('must be called with an even number extra args', function() {
    (function() { set({}, 1); }).should.throw();
    (function() { set({}, 1, 2, 3); }).should.throw();
  });
});

describe('mapKeys', function() {
  it('maps over keys', function() {
    var a = {a: 1, b: 2};
    into({}, mapKeys(function(x) { return x.toUpperCase() }), a).should.eql({A: 1, B: 2});
  });
  it('works with map-entry likes', function() {
    var x = [ ['a', 1] ]
    into({}, mapKeys(function(x) { return x.toUpperCase() }), x).should.eql({A: 1});
  });
});

describe('mapVals', function() {
  it('maps over vals', function() {
    var a = {a: 1, b: 2};
    into({}, mapVals(inc), a).should.eql({a: 2, b: 3});
  });
  it('works with map-entry likes', function() {
    var x = [ Vector('a', 1) ]
    into({}, mapVals(inc), x).should.eql({a: 2});
  });
});

describe('getPath', function() {
  it('gets nested assocs by a path', function() {
    getPath({a: {b: 23}}, ['a', 'b']).should.eql(23);
    getPath({a: {b: 23}}, ['a', 'z']).should.eql(nil);
    getPath({a: {b: 23}}, ['a', 'b', 'c'], 42).should.eql(42);
  });
});

describe('setPath', function() {
  it('sets nested assocs by a path', function() {
    setPath({a: {b: 23}}, ['a', 'b'], 42).should.eql({a: {b: 42}});
    setPath({}, ['a', 'b'], 23).should.eql({a: {b: 23}});
  });
});

describe('keys', function() {
  it('returns the keys from the map', function() {
    keys({a: 1, b: 2}).toArray().should.eql(['a','b']);
  });
});

describe('vals', function() {
  it('returns the values from the map', function() {
    vals({a: 1, b: 2}).toArray().should.eql([1, 2]);
  });
});

describe('zipMap', function() {
  it('zips keys and vals into a Map', function() {
    var x = {a: 1, b: 2};
    into({}, zipMap(vals(x), keys(x))).should.eql({1: "a", 2: "b"});
  });
});
