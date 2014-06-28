var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var RE_OBJ = /\{([^}]+)\}/;

var Transform = stream.Transform;

var Parser = function(opt) {
  Transform.call(this, opt);
}

module.exports = Parser;
Parser.EOL     = EOL;
Parser.yeild   = function(child) {
  util.inherits(child, Parser);
}

util.inherits(Parser, Transform);

function arrayfy(line) {
  return line.match(RE_OBJ)[1].split(' ');
}

Parser.prototype.contains = function(line, keywords) {
  if (Object.prototype.toString.call(keywords) === '[object Array]')
    new Error('keywords must be an array');

  var key  = _.find(keywords, function(key) {
    return line.indexOf(key) == 0;
  });

  return !!key;
}

Parser.prototype.trim = function(chunk) {
  if (chunk instanceof Buffer)
    return chunk.toString('utf8').trim();
  else if (chunk instanceof String)
    return chunk.trim();
  else
    new Error('must pass Buffer or String');
}

Parser.prototype.parseActivityInfo = function(info) {

  var arr = arrayfy(info);

  // see com.android.server.am.ActivityRecord.toString();
  var result = {};

  result['name']   = '';
  result['hash']   = arr[0];
  result['userId'] = arr[1].substring(1);
  result['intent'] = arr[2]
  result['taskId'] = arr[3].substring(1);

  return result;
}

Parser.prototype.parseIntentInfo = function(info) {

  var arr    = arrayfy(info);
  var result = {}

  _.each(arr, function(i) {
    if (i.indexOf('act=') == 0)
      result['action'] = i.substring(4);
    else if (i.indexOf('cat=') == 0)
      result['category'] = i.substring(4);
    else if (i.indexOf('flg=') == 0)
      result['flag'] = i.substring(4);
    else if (i.indexOf('pkg') == 0)
      result['package'] = i.substring(4);
    else if (i.indexOf('cmp=') == 0)
      result['component'] = i.substring(4);
    else if (i.indexOf('bnds=') == 0)
      result['bounds'] = i.substring(5);
  });

  return result;
}

Parser.prototype.parseTaskInfo = function(info) {
  // see com.android.server.am.TaskRecord.toString()

  var arr    = arrayfy(info);
  var result = {}

  result['hash']   = arr[0]
  result['taskId'] = arr[1].substring(1);

  _.each(arr.slice(2), function(i) {
    if (i.indexOf('U=') == 0)
      result['userId'] = i.substring(2);
    else if (i.indexOf('sz=') == 0)
      result['activities'] = i.substring(3);
    else if (i.indexOf('A=') == 0)
      result['affinity'] = i.substring(2);
    else if (i.indexOf('I=') == 0)
      result['intent'] = i.substring(2);
    else if (i.indexOf('aI=') == 0)
      result['affinityIntent'] = i.substring(3);
  });

  return result;
}
