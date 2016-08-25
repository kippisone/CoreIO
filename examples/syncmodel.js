'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');
let express = require('express');
let app = express();

log.sys('Start sync model');

// function getBrowser(ua) {
//   return ua;
// }

let syncModel = new CoreIO.SyncModel('example', {
  defaults: {
    counter: 0,
    connections: 0
  }
});

// let syncList = new CoreIO.SyncList('example-list', {
//
// });

app.get('/count', (req, res) => {
  let count = syncModel.get('counter');
  syncModel.set('counter', count += 1);
  // syncList.push({
  //   browser: getBrowser(req.get('user-agent')),
  //   time: (new Date()).toString()
  // });
  res.send('OK');
});

let monitoring = syncModel.socket.monitor();
monitoring.on('client.connect', () => {
  let stats = monitoring.stats();
  syncModel.set('connections', stats.connections);
});

monitoring.on('client.disconnect', () => {
  let stats = monitoring.stats();
  syncModel.set('connections', stats.connections);
});

app.listen(6446);

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
