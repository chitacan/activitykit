var P = require('./parser');

var PREFIX = 'ActivityRecord{';

var ActivityRecord = function(opt) {
  P.call(this, opt);
}

module.exports = ActivityRecord;

P.yeild(ActivityRecord);

ActivityRecord.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var line = this.trim(chunk);
  var idx  = line.indexOf(PREFIX);
  if (idx >= 0) {
    var startIdx = idx + PREFIX.length;
    var endIdx   = line.length - 1;

    var result = this.parseActivityInfo(line);

    if (line.indexOf('* Hist') == 0) {
      result['history'] = line.substring(2, idx - 2);
      result['type'] = 'history'
      this.push(JSON.stringify(result) + P.EOL);
    } else if (line.indexOf('Recent #') == 0) {
      result['name'] = line.substring(0, idx - 2);
      result['type'] = 'recent'
      this.push(JSON.stringify(result) + P.EOL);
    } else {
      // 'mFocusedActivity:'
      name = line.substring(0, idx);
      name += JSON.stringify(result);
      this.push(name + P.EOL);
    }
  } else {
    this.push(chunk);
  }

  done();
}
