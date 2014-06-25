var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX_STACK = 'Stack #';
var PREFIX_TASK  = 'Task id #';

var Transform = stream.Transform;

var StackParser = function(opt) {
  Transform.call(this, opt);
  this._inTask  = false;

  this._result = {
    stack  : {},
    focused: '',
    recent : []
  };
  this._task   = [];

  this._stackId = '';
}

module.exports = StackParser;

util.inherits(StackParser, Transform);

StackParser.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var result   = '';
  var line     = chunk.toString('utf8').trim();
  var isStack  = line.indexOf(PREFIX_STACK)    == 0;
  var isTask   = line.indexOf(PREFIX_TASK )    == 0;
  var isFocus  = line.indexOf('mFocused')      == 0;
  var isRecent = line.indexOf('Recent tasks:') == 0;

  // 'Stack #0:'
  if (isStack) {
    var stackId = line.substring(PREFIX_STACK.length, line.length - 1);
    this._result.stack[stackId] = [];
    this._stackId = stackId;
  }
  // 'Task id #2'
  else if (isTask) {
    var task = {
      taskId  : line.substring(PREFIX_TASK.length, line.length),
      data    : '',
      history : []
    }
    this._inTask = true;
    this._result.stack[this._stackId].push(task);
  } else if (isFocus) {
    this._inTask  = false;
  } else if (isRecent) {
    this._inTask  = false;
  } else {
    if (this._inTask) {
      var taskArr = this._result.stack[this._stackId];
      var task    = taskArr[taskArr.length - 1];
      if (!task.data)
        task.data = JSON.parse(line);
      else {
        task.history.push(JSON.parse(line));
      }
    }
  }

  done();
}

StackParser.prototype._flush = function(done) {
  this.push(JSON.stringify(this._result, null, 4));
  done();
}
