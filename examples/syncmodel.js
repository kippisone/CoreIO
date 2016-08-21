'use strict';

let CoreIO = require('../src/coreio');
let log = require('logtopus').getLogger('coreio-example');

log.sys('Start sync model');

let syncModel = new CoreIO.SyncModel('example', {

});

log.sys(' ... listen on port:', syncModel.port);
log.sys(' ... registered path:', syncModel.path);
log.sys(' ... registered channel:', syncModel.socket.channel);
