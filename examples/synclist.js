'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');
let express = require('express');
let app = express();

log.sys('Start sync list');

let syncList = new CoreIO.SyncList('example', {

});

app.post('/list/add', (req, res) => {
  syncList.push({
    value: req.body.name
  });

  res.send('OK');
});

let monitoring = syncModel.socket.monitor();
monitoring.on('client.connect', () => {
  let stats = monitoring.stats();
  // syncModel.set('connections', stats.connections);
  console.log('Connections:', stats.connections);
});

monitoring.on('client.disconnect', () => {
  let stats = monitoring.stats();
  // syncModel.set('connections', stats.connections);
  console.log('Connections:', stats.connections);
});

app.listen(6446);

log.sys(' ... listen on port:', syncList.port);
log.sys(' ... registered path:', syncList.path);
log.sys(' ... registered channel:', syncList.socket.channel);
