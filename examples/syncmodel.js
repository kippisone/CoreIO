'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');
let express = require('express');
let app = express();

log.sys('Start sync model');

let syncModel = new CoreIO.SyncModel('example', {
  defaults: {
    counter: 0,
    connections: 0
  }
});

app.get('/count', (req, res) => {
  let count = syncModel.get('counter');
  syncModel.set('counter', count += 1);
  res.send('OK');
});

syncModel.socket.__socket.on('connection', () => {
  console.log('GOT sock', this);
  syncModel.set('connections', syncModel.socket.__socket.connections.length)
});


app.listen(6446);

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
