'use strict';

let CoreIO = {
  logLevel: 'sys'
};

require('./utils')(CoreIO);
CoreIO.Event = require('./event')(CoreIO);
CoreIO.Model = require('./model')(CoreIO);

/**
 * Creates a model class
 *
 * @method createModel
 * @version v1.0.0
 *
 * @param  {string} name Model name
 * @param  {object} opts Model options
 * @returns {object} Returns a model class
 */
CoreIO.createModel = function(name, opts) {
  return CoreIO.Model.inherit(name, opts);
};

/**
 * Creates a service class
 *
 * @method createService
 * @version v1.0.0
 *
 * @param  {string} name Service name
 * @param  {object} opts Service options
 * @returns {object} Returns a service class
 */
CoreIO.createService = function(name, opts) {
  return CoreIO.Service.inherit(name, opts);
};

module.exports = CoreIO;
