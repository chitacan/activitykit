var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var Transform = stream.Transform;

var KeywordParser = function(opt) {
  Transform.call(this, opt);
}

module.exports = KeywordParser;

util.inherits(KeywordParser, Transform);

var KEYWORD = [
  'Stack #',
  'Task id #',
  '* TaskRecord',
  '* Hist',
  //'intent=',
  'mFocusedActivity:',
  'Recent tasks:',
  '* Recent #',
];

KeywordParser.prototype._transform = function(chunk, encoding, cb) {
  if (chunk.length === 0) {
    cb();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var key  = _.find(KEYWORD, function(key) {
    return line.indexOf(key) == 0;
  });

  if (key) {
    this.push(line + EOL);
  } else {
    this.emit('non-keyword', line + EOL);
  }

  cb();
}
