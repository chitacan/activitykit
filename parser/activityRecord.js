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

    //var activityInfoArray = line.substring(startIdx, endIdx).split(' ');
    var activityInfo      = this.parseActivityInfo(line);

    var result = {};
    var name;
    if (line.indexOf('* Hist') == 0) {
      name = line.substring(2, idx - 2);
      result[name] = activityInfo;
      this.push(JSON.stringify(result) + P.EOL);
    } else if (line.indexOf('Recent #') == 0) {
      name = line.substring(0, idx - 2);
      result[name] = activityInfo;
      this.push(JSON.stringify(result) + P.EOL);
    } else {
      // 'mFocusedActivity:'
      name = line.substring(0, idx);
      name += JSON.stringify(activityInfo);
      this.push(name + P.EOL);
    }
  } else {
    this.push(chunk);
  }

  done();
}
