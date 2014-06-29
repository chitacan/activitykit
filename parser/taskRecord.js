var P = require('./parser')

var PREFIX = 'TaskRecord{';

var TaskRecord = function(opt) {
  P.call(this, opt);
}

module.exports = TaskRecord;

P.yeild(TaskRecord);

TaskRecord.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var line = this.trim(chunk);
  var idx  = line.indexOf(PREFIX);
  if (idx >= 0) {
    var taskInfo = this.parseTaskInfo(line);
    taskInfo['type'] = 'task';

    // "* TaskRecord{42d6 ..."
    if (idx == 2) {
      this.push(JSON.stringify(taskInfo) + P.EOL);
    }
    // "* Recent #1: ..."
    else {
      taskInfo['name'] = line.substring(2, idx - 2);
      this.push(JSON.stringify(taskInfo) + P.EOL);
    }
  } else {
    this.push(chunk);
  }

  done();
}
