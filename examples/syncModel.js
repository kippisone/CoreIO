'use strict';

const CoreIO = require('../src/coreio');
const MongoDBService = require('coreio-mongodb')(CoreIO);

CoreIO.setConf('mongodb', 'mongodb://localhost:27017/coreio-example');

const fruitsModel = new CoreIO.SyncModel('fruits', {
  defaults: {
    banana: 'yellow',
    apple: 'red'
  },

  service: MongoDBService,
  autoSave: true
});

fruitsModel.set('lemon', 'yellow');
