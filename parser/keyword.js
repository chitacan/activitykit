var P = require('./parser');

var KEYWORDS = [
  'Stack #',
  'Task id #',
  '* TaskRecord',
  '* Hist',
  'intent=',
  'Intent {',
  'mFocusedActivity:',
  'Recent tasks:',
  '* Recent #',
];

var Keyword = function(opt) {
  P.call(this, opt);
}

module.exports = Keyword;

P.yeild(Keyword, P);

Keyword.prototype._transform = function(chunk, encoding, done) {
  if (chunk.length === 0) {
    done();
    return;
  }

  var line = this.trim(chunk);
  if (this.contains(line, KEYWORDS)) {
    this.push(line + P.EOL);
  }

  done();
}
