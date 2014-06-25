var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX_A = 'intent=';
var PREFIX_B = 'Intent {';

var Transform = stream.Transform;

var IntentParser = function(opt) {
  Transform.call(this, opt);
}

module.exports = IntentParser;

util.inherits(IntentParser, Transform);

IntentParser.prototype._transform = function(chunk, encoding, done) {

  function parseIntentInfo(intentArr) {
    var result  = {}

    _.each(intentArr, function(i) {
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

  if (chunk.length === 0) {
    done();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var a_idx  = line.indexOf(PREFIX_A);
  var b_idx  = line.indexOf(PREFIX_B);

  if (a_idx == 0) {
    var intentArr = line.substring(PREFIX_A.length + 1, line.length -1).split(' ');
    var intent    = parseIntentInfo(intentArr);
    this.push('intent: ' + JSON.stringify(intent) + EOL);
  } else if (b_idx == 0) {
    var intentArr = line.substring(PREFIX_B.length + 1, line.length -1).split(' ');
    var intent    = parseIntentInfo(intentArr);
    this.push('intent: ' + JSON.stringify(intent) + EOL);
  } else {
    this.push(chunk);
  }

  done();
}
