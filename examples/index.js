'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');
let express = require('express');
let app = express();
let bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'content-type');
  next();
});

log.sys('Start sync model');

let syncModel = new CoreIO.SyncModel('example', {
  defaults: {
    counter: 0,
    connections: 0
  }
});

let syncList = new CoreIO.SyncList('example', {

});

// app.get('/count', (req, res) => {
//   let count = syncModel.get('counter');
//   syncModel.set('counter', count += 1);
//   res.send(204);
// });
CoreIO.api(syncModel, {
  allow: 'READ, CREATE'
});

app.post('/list/add', (req, res) => {
  syncList.push({
    value: req.body.value
  });

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
