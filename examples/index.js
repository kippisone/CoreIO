'use strict';

let CoreIO = require('../lib/coreio');
let MongoDBService = require('coreio-mongodb')(CoreIO);
let log = require('logtopus').getLogger('coreio-example');
let log2 = require('logtopus').getLogger('coreio');
log2.setLevel('debug');

log.sys('Start sync model');

CoreIO.setConf('mongodb', 'mongodb://localhost:27017/coreio-example');

let syncModel = new CoreIO.SyncModel('hitcounter', {
  defaults: {
    counter: 0
  },

  service: MongoDBService,
  autoSave: true,

  schema: {
    counter: { type: 'number' }
  }
});

let connectionModel = new CoreIO.SyncModel('connectionCounter', {
  defaults: {
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

let monitoring = connectionModel.socket.monitor();
let updateConnectionsCounter = function() {
  let stats = monitoring.stats();
  connectionModel.set('connections', stats.connections);
};

monitoring.on('client.connect', updateConnectionsCounter);
monitoring.on('client.disconnect', updateConnectionsCounter);
updateConnectionsCounter();

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
