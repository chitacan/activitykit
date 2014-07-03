var P = require('./parser')
  , _ = require('underscore')

var PREFIX_STACK = 'Stack #';
var PREFIX_TASK  = 'Task id #';

var Stack = function(opt) {
  P.call(this, opt);
  this._in = '';

  this._result = {
    stack  : {
      name: 'root',
      type: 'root',
      children: []
    },
    focused: '',
    recent : []
  };
  this._stack   = {};
  this._task    = {};
  this._recent  = {};
  this._history = {};

  this._stackName = '';
}

module.exports = Stack;

P.yeild(Stack);

Stack.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var result   = '';
  var line     = this.trim(chunk);
  var isStack  = line.indexOf(PREFIX_STACK)    == 0;
  var isTask   = line.indexOf(PREFIX_TASK )    == 0;
  var isFocus  = line.indexOf('mFocused')      == 0;
  var isRecent = line.indexOf('Recent tasks:') == 0;
  var isIntent = line.indexOf('intent: ')      == 0;

  // 'Stack #0:'
  if (isStack) {
    if (!_.isEmpty(this._stack))
      this._result.stack.children.push(this._stack);

    this._stack = {
      name: line,
      type: 'stack',
      children: []
    }
  }
  // 'Task id #2'
  else if (isTask) {
    if (!_.isEmpty(this._task))
      this._stack.children.push(this._task);

    this._task = {
      name: line,
      intent: {},
      data: {},
      children: []
    }
    this._in = 'task';
  }
  // 'mFocusedActivity:'
  else if (isFocus) {
    this._result.focused = JSON.parse(line.split(' ')[1]);
  }
  // 'Recent tasks:'
  else if (isRecent) {
    this._in = 'recent';
  }
  // 'intent:'
  else if (isIntent) {
    var intent = JSON.parse(line.split(' ')[1]);
    if (this._in === 'recent') {
      this._recent.intent = intent
    } else if (this._in === 'task') {
      this._task.intent = intent
    } else if (this._in === 'history') {
      this._history.intent = intent;
      this._task.children.push(this._history);
    }
  }
  // task data or history
  else {
    if (this._in === 'task' || this._in === 'history') {
      if (_.isEmpty(this._task.data))
        this._task.data = JSON.parse(line);
      else {
        this._in = 'history'
        this._history = JSON.parse(line);
      }
    }
    else {
      if (!_.isEmpty(this._recent))
        this._result.recent.push(this._recent);
      this._recent = JSON.parse(line);
    }
  }

  done();
}

Stack.prototype._flush = function(done) {
  // assemble remainder
  if (!_.isEmpty(this._task))
    this._stack.children.push(this._task);

  if (!_.isEmpty(this._stack))
    this._result.stack.children.push(this._stack);

  if (!_.isEmpty(this._recent))
    this._result.recent.push(this._recent);

  this.push(JSON.stringify(this._result, null, 4));
  done();
}
