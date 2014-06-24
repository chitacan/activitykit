var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX_TASK = 'TaskRecord{';

var Transform = stream.Transform;

var TaskRecordParser = function(opt) {
  Transform.call(this, opt);
}

module.exports = TaskRecordParser;

util.inherits(TaskRecordParser, Transform);

TaskRecordParser.prototype._transform = function(chunk, encoding, cb) {

  function parseTaskInfo(taskInfoArray) {
    // see com.android.server.am.TaskRecord.toString()
    var result = {}
    result['hash']     = taskInfoArray[0]
    result['taskId']   = taskInfoArray[1].substring(1);
    // this can be either 'A=' or 'I='
    result['affinity'] = taskInfoArray[2].substring(2);
    result['user']     = taskInfoArray[3].substring(2);
    result['history']  = taskInfoArray[4].substring(2);

    return result;
  }

  if (chunk.length === 0) {
    cb();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var idx  = line.indexOf(PREFIX_TASK);
  if (idx >= 0) {
    var taskInfoArray = line.substring(idx + PREFIX_TASK.length, line.length -1).split(' ');
    var taskInfo      = parseTaskInfo(taskInfoArray);

    if (idx == 2) {
      this.push(JSON.stringify(taskInfo) + EOL);
    } else {
      this.push(line.substring(0, idx) + JSON.stringify(taskInfo) + EOL);
    }
  } else {
    this.push(chunk);
  }

  cb();
}
