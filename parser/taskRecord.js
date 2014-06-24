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
  if (chunk.length === 0) {
    cb();
    return;
  }

  var line = chunk.toString('utf8').trim();
  var idx  = line.indexOf(PREFIX_TASK);
  if (idx >= 0) {
    var r = line.substring(idx + PREFIX_TASK.length, line.length -1).split(' ');
    var obj = {};
    obj['hash']     = r[0]
    obj['taskId']   = r[1].substring(1);
    // this can be either 'A=' or 'I='
    obj['affinity'] = r[2].substring(2);
    obj['user']     = r[3].substring(2);
    obj['history']  = r[4].substring(2);

    if (idx == 2) {
      this.push(JSON.stringify(obj) + EOL);
    } else {
      this.push(line.substring(0, idx) + JSON.stringify(obj) + EOL);
    }
  } else {
    this.push(chunk);
  }

  cb();
}
