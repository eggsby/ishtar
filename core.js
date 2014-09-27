"use strict";

var Immutable = require("immutable"),
    equals = Immutable.is;

var nil = require("./lib/nil");

var proto = require("./lib/proto"),
    defprotocol = proto.defprotocol,
    self = proto.self,
    extend = proto.extend,
    satisfies = proto.satisfies;

var collections = require("./lib/collections"),
    Map = collections.Map,
    MapEntry = collections.MapEntry,
    Vec = collections.Vec,
    Set = collections.Set,
    LazySeq = collections.LazySeq;

var protocols = require("./lib/protocols"),
    ISeq = protocols.ISeq,
    IPending = protocols.IPending,
    IAppend = protocols.IAppend,
    ICollection = protocols.ICollection;

var seq = ISeq.seq,
    first = ISeq.first,
    rest = ISeq.rest,
    cons = ISeq.cons;

var count = ICollection.count,
    empty = ICollection.empty;

var conj = IAppend.conj;

var realized = IPending.realized;

function inc(x) {
  return x + 1;
}

function dec(x) {
  return x - 1;
}

function second(coll) {
  return first(rest(coll));
}

function isEmpty(coll) {
  return seq(coll) === nil;
}

function seqable(coll) {
  return seq(coll) !== nil;
}

function doseq(coll, fn) {
  while (seqable(coll)) {
    fn.call(null, first(coll));
    coll = rest(coll);
  }
  return nil;
}

function take(n, coll) {
  if (n > 0 && seqable(coll)) {
    return cons(first(coll), take(n-1, rest(coll)));
  } else {
    return empty(coll);
  }
}

function drop(n, coll) {
  while (n > 0 && seqable(coll)) {
    coll = rest(coll);
    n -= 1;
  }
  return coll;
}

function takeWhile(pred, coll) {
  if(seqable(coll)) {
    var next = first(coll);
    if (pred(next)) return cons(next, takeWhile(pred, rest(coll)));
  }
  return empty(coll);
}

function transconj() {
   // conj with transducer arity
   switch (arguments.length) {
     case 0: return Vec();
     default:
       return conj.apply(null, arguments);
   };
}

function mapping(fn) {
  return function(step) {
    return function(result, input) {
      switch (arguments.length) {
	case 0: return step();
	case 1: return step(result);
	case 2: return step(result, fn(input));
	default: return nil;
      };
    };
  };
}

function map(fn, coll) {
  // Map a function over a collection.
  switch (arguments.length) {
    case 1: return mapping(fn);
    case 2:
      if (isEmpty(coll)) { 
	return coll;
      } else {
        return LazySeq(function() {
          return cons(fn(first(coll)), map(fn, rest(coll)));
        });
      }
    default: return nil;
  }
}

function reduce(fn /* coll || init, coll */) {
  // reduces sequences
  switch (arguments.length) {
    case 2:
      var coll = arguments[1]; 
      if (seqable(coll)) {
        return reduce(fn, first(coll), rest(coll));
      } else {
        return fn();
      }
    case 3:
      var init = arguments[1], coll = arguments[2];
      if (seqable(coll)) {
        var result = init;
        doseq(coll, function(x) {
          result = fn(result, x);
        });
        return result;
      } else {
        return init;
      }
    default: return nil;
  }
}

function transduce(xform, step, init, coll) {
  switch (arguments.length) {
    case 3: // no init supplied, coll as third arg
      coll = arguments[2];
      return reduce(xform(step), step(), coll);
    case 4:
      return reduce(xform(step), init, coll);
    default: return nil;
  }
}

function doall(coll) {
  if (isEmpty(coll)) return coll;
  return cons(first(coll), doall(rest(coll)));
}

function iterate(fn, x) {
  // lazy sequence generator
  return cons(x, LazySeq(function() {
    return iterate(fn, fn(x));
  }));
}

function range(start, end, step) {
  // returns a lazy, possibly infinite range of numbers
  switch (arguments.length) {
    case 0: return range(0, Infinity, 1);
    case 1: return range(0, start, 1);
    case 2: return range(start, end, 1);
    case 3:
      var compare;
      if (step === 0 || start === end) compare = function(x, end) { return x !== end; };
      if (step > 0) compare = function(x, end) { return x < end; };
      if (step < 0) compare = function(x, end) { return x > end; };
      if (compare(start, end)) {
	return cons(start, LazySeq(function() {
	  return range(start + step, end, step);
	}));
      } else {
	return nil;
      }
  }
}

var module = module || {};
module.exports = {
  equals: Immutable.is,

  realized: realized,

  seq: seq,
  first: first,
  rest: rest,
  cons: cons,

  conj: transconj,

  inc: inc,
  dec: dec,

  count: count,
  empty: empty,

  take: take,
  takeWhile: takeWhile,
  drop: drop,
  second: second,

  nil: nil,

  // xform 
  doall: doall,
  doseq: doseq,
  map: map,
  reduce: reduce,
  iterate: iterate,
  range: range,

  transduce: transduce,

  // data structures
  LazySeq: LazySeq,
  Map: Immutable.Map,
  MapEntry: MapEntry,
  Vec: Immutable.Vector,
  Set: Immutable.Set,

  // protocols
  defprotocol: defprotocol,
  self: self,
  extend: extend,
  satisfies: satisfies,

  // utility fns
  exports: function(obj) {
    Object.keys(module.exports).forEach(function(key) {
      obj[key] = module.exports[key];
    });
  }
};
