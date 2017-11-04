
var str = require('./string-proto');
var base = require('./source');
var hook = require('./wrapper');

base.fuse(hook, base);

module.exports = hook;
