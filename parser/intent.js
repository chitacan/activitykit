var P = require('./parser');

var PREFIX_A = 'intent=';
var PREFIX_B = 'Intent {';

var Intent = function(opt) {
  P.call(this, opt);
}

module.exports = Intent;

P.yeild(Intent);

Intent.prototype._transform = function(chunk, encoding, done) {

  if (chunk.length === 0) {
    done();
    return;
  }

  var line  = this.trim(chunk);
  var a_idx = line.indexOf(PREFIX_A);
  var b_idx = line.indexOf(PREFIX_B);

  if (a_idx == 0) {
    var intent    = this.parseIntentInfo(line);
    this.push('intent: ' + JSON.stringify(intent) + P.EOL);
  } else if (b_idx == 0) {
    var intent    = this.parseIntentInfo(line);
    this.push('intent: ' + JSON.stringify(intent) + P.EOL);
  } else {
    this.push(chunk);
  }

  done();
}
