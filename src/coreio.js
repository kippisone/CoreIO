'use strict';

let CoreIO = {
  logLevel: 'sys'
};

require('./utils')(CoreIO);
CoreIO.Event = require('./event')(CoreIO);
CoreIO.Model = require('./model')(CoreIO);

module.exports = CoreIO;
