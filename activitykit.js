var adb    = require('adbkit')
  , fs     = require('fs')
  , es     = require('event-stream')
  , KW     = require('./parser/keyword')
  , TR     = require('./parser/taskRecord')
  , AR     = require('./parser/activityRecord')
  , ST     = require('./parser/stack')
  , IN     = require('./parser/intent')
  , client = adb.createClient();

function getActivityInfo() {

  var keywordParser        = new KW()
    , taskRecordParser     = new TR()
    , activityRecordParser = new AR()
    , stackParser          = new ST()
    , intentParser         = new IN();

  return client.listDevices()
  .then(function(devices) {
    if (!devices.length)
      throw new Error('device not found');

    // select first one
    return devices[0];
  })
  .then(function(device) {
    var cmd = ['dumpsys', 'activity', 'activities'];
    return client.shell(device.id, cmd);
  })
  .then(function(result) {
    return result
    .pipe(es.split())
    .pipe(keywordParser)
    .pipe(taskRecordParser)
    .pipe(activityRecordParser)
    .pipe(intentParser)
    .pipe(stackParser)
  })
}

if (!module.parent) {
  getActivityInfo().then(function(stream) {
    stream.pipe(process.stdout);
  });
}

exports.getActivityInfo = getActivityInfo;
