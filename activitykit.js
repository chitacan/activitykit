var adb     = require('adbkit')
  , fs      = require('fs')
  , es      = require('event-stream')
  , KP      = require('./parser/keyword')
  , TRP     = require('./parser/taskRecord')
  , client  = adb.createClient();

var keywordParser    = new KP();
var taskRecordParser = new TRP();

client.listDevices()
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
  result
  .pipe(es.split())
  .pipe(keywordParser)
  .pipe(taskRecordParser)
  .pipe(process.stdout)
})
.catch(function(err) {
  console.log(err);
});