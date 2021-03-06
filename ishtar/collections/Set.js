var Immutable = require("immutable"),
    Set = Immutable.Set;

var dispatch = require("../dispatch"),
    extend = dispatch.extend;

var protocols = require("../protocols"),
    ISeq = protocols.ISeq,
    IAppend = protocols.IAppend;

var nil = require("../nil");

extend(Set, ISeq, {
  seq: function(coll) { return coll.length ? coll : nil; },
  first: function(coll) { return coll.length ? coll.first() : nil; },
  rest: function(coll) { return coll.rest().toSet(); },
  cons: function(el, coll) { return coll.add(el); }
});

extend(Set, IAppend, {
  append: function(coll, el) { return coll.add(el); },
  empty: function(coll) { return Set(); }
});

module.exports = Set;
