'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');

log.sys('Start sync model');

let syncModel = new CoreIO.SyncModel('example', {
  defaults: {
    counter: 0,
    connections: 0
  }
});

let syncList = new CoreIO.SyncList('example', {

});

CoreIO.api(syncModel, {
  allow: 'READ, CREATE'
});

CoreIO.api('/count').get((req, res) => {
  let count = syncModel.get('counter');
  syncModel.set('counter', count += 1);
  res.sendStatus(204);
});

CoreIO.api(syncList, {
  slug: '/list',
  allow: 'READ, CREATE'
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

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
