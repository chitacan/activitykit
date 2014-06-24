var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX = 'TaskRecord{';

var Transform = stream.Transform;

var TaskRecordParser = function(opt) {
  Transform.call(this, opt);
}

module.exports = TaskRecordParser;

util.inherits(TaskRecordParser, Transform);

TaskRecordParser.prototype._transform = function(chunk, encoding, cb) {

  function parseTaskInfo(taskInfoArray) {
    // see com.android.server.am.TaskRecord.toString()
    var result  = {}

    result['hash']   = taskInfoArray[0]
    result['taskId'] = taskInfoArray[1].substring(1);

    _.each(taskInfoArray.slice(2), function(i) {
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

  if (chunk.length === 0) {
    cb();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var idx  = line.indexOf(PREFIX);
  if (idx >= 0) {
    var startIdx = idx + PREFIX.length;
    var endIdx   = line.length - 1;

    var taskInfoArray = line.substring(startIdx, endIdx).split(' ');
    var taskInfo      = parseTaskInfo(taskInfoArray);

    // "* TaskRecord{42d6 ..."
    if (idx == 2) {
      this.push(JSON.stringify(taskInfo) + EOL);
    }
    // "* Recent #1: ..."
    else {
      var recentInfo   = {}
      var name         = line.substring(2, idx - 2);
      recentInfo[name] = taskInfo;
      this.push(JSON.stringify(recentInfo) + EOL);
    }
  } else {
    this.push(chunk);
  }

  cb();
}
