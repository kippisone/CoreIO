'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let express = require('express');
let app = express();

log.sys('Start sync model');

let syncModel = new CoreIO.SyncModel('example', {
  defaults: {
    counter: 0
  }
});

app.get('/count', (req, res) => {
  let count = syncModel.get('counter');
  syncModel.set('counter', count += 1);
  res.send('OK');
});

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
