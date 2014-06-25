var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX = 'ActivityRecord{';

var Transform = stream.Transform;

var ActivityRecordParser= function(opt) {
  Transform.call(this, opt);
}

module.exports = ActivityRecordParser;

util.inherits(ActivityRecordParser, Transform);

ActivityRecordParser.prototype._transform = function(chunk, encoding, cb) {

  function parseActivityInfo(activityInfoArray) {
    // see com.android.server.am.ActivityRecord.toString();
    var result = {};

    result['hash'] = activityInfoArray[0];
    result['userId'] = activityInfoArray[1].substring(1);
    result['intent'] = activityInfoArray[2]
    result['taskId'] = activityInfoArray[3].substring(1);

    return result;
  }

  if (chunk.length === 0) {
    cb();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var idx  = line.indexOf(PREFIX);
  if (idx >= 0) {
    var startIdx = idx + PREFIX.length;
    var endIdx   = line.length - 1;

    var activityInfoArray = line.substring(startIdx, endIdx).split(' ');
    var activityInfo      = parseActivityInfo(activityInfoArray);

    var result = {};
    var name;
    if (line.indexOf('* Hist') == 0) {
      name = line.substring(2, idx - 2);
      result[name] = activityInfo;
      this.push(JSON.stringify(result) + EOL);
    } else if (line.indexOf('Recent #') == 0) {
      name = line.substring(0, idx - 2);
      result[name] = activityInfo;
      this.push(JSON.stringify(result) + EOL);
    } else {
      name = line.substring(0, idx);
      name += JSON.stringify(activityInfo);
      this.push(name + EOL);
    }
  } else {
    this.push(chunk);
  }

  cb();
}
