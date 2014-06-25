var stream  = require('stream')
  , EOL     = require('os').EOL
  , util    = require('util')
  , _       = require('underscore')

var PREFIX_STACK = 'Stack #';
var PREFIX_TASK  = 'Task id #';

var Transform = stream.Transform;

var StackParser = function(opt) {
  Transform.call(this, opt);
  this._inStack = false;
  this._inTask  = false;

  this._result = {};
  this._task   = [];

  this._stackName = '';
  this._taskName = '';
}

module.exports = StackParser;

util.inherits(StackParser, Transform);

StackParser.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var result = '';
  var line = chunk.toString('utf8').trim();
  var isStack  = line.indexOf(PREFIX_STACK)    == 0;
  var isTask   = line.indexOf(PREFIX_TASK )    == 0;
  var isFocus  = line.indexOf('mFocused')      == 0;
  var isRecent = line.indexOf('Recent tasks:') == 0;

  if (isStack) {
    var name = line.substring(0, line.length -1);
    this._result[name] = [];
    this._inStack = true;
    this._stackName = name;
  } else if (isTask) {
    var task = {
      name : line,
      data : '',
      history : []
    }
    this._inTask = true;
    this._result[this._stackName].push(task);
  } else if (isFocus) {
    this._inStack = false;
    this._inTask = false;
  } else if (isRecent) {
  } else {
    if (this._inTask) {
      var taskArr = this._result[this._stackName];
      var task    = taskArr[taskArr.length - 1];
      if (!task.data)
        task.data = JSON.parse(line);
      else {
        task.history.push(JSON.parse(line));
      }
    }
  }

  //this.push(line);
  done();
}
