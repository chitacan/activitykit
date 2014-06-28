var P = require('./parser');

var PREFIX_STACK = 'Stack #';
var PREFIX_TASK  = 'Task id #';

var Stack = function(opt) {
  P.call(this, opt);
  this._inTask   = false;
  this._inRecent = false;
  this._inHistory = false;

  this._result = {
    stack  : {},
    focused: '',
    recent : []
  };
  this._task   = {};
  this._recent = {};
  this._history = {};

  this._stackId = '';
}

module.exports = Stack;

P.yeild(Stack);

Stack.prototype._transform = function(chunk, encoding, done) {

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
  var isIntent = line.indexOf('intent: ')      == 0;

  // 'Stack #0:'
  if (isStack) {
    var stackId = line.substring(PREFIX_STACK.length, line.length - 1);
    this._result.stack[stackId] = [];
    this._stackId = stackId;
  }
  // 'Task id #2'
  else if (isTask) {
    this._task = {
      taskId  : line.substring(PREFIX_TASK.length, line.length),
      data    : '',
      intent  : {},
      history : []
    }
    this._inTask = true;
    this._inHistory = false;
  }
  // 'mFocusedActivity:'
  else if (isFocus) {
    this._inTask  = false;
    this._result.focused = JSON.parse(line.split(' ')[1]);
  }
  // 'Recent tasks:'
  else if (isRecent) {
    this._inTask  = false;
    this._inRecent = true;
  }
  // 'intent:'
  else if (isIntent) {
    if (this._inTask) {
      this._task.intent = JSON.parse(line.split(' ')[1]);
      this._result.stack[this._stackId].push(this._task);
    } else if (this._inRecent) {
      this._recent.intent = JSON.parse(line.split(' ')[1]);
      this._result.recent.push(this._recent);
    } else if (this._inHistory) {
      var k = Object.keys(this._history)[0]
      this._history[k].intent = JSON.parse(line.split(' ')[1]);
      var stack = this._result.stack[this._stackId];
      stack[stack.length - 1].history.push(this._history);
    }
  } else {
    // task data or history
    if (this._inTask) {
      if (!this._task.data)
        this._task.data = JSON.parse(line);
      else {
        this._inTask = false;
        this._inHistory = true;
        this._history = JSON.parse(line);
      }
    } else if (this._inRecent) {
      this._recent = JSON.parse(line);
    }
  }

  done();
}

Stack.prototype._flush = function(done) {
  this.push(JSON.stringify(this._result, null, 4));
  done();
}
