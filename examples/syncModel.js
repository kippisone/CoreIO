'use strict';

const CoreIO = require('../src/coreio');

const fruitsModel = new CoreIO.SyncModel('fruits', {
  defaults: {
    banana: 'yellow',
    apple: 'red'
  }
});

fruitsModel.set('lemon', 'yellow');
